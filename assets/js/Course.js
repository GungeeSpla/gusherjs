import * as constants from './constants.js';
import * as utilities from './utilities.js';
import Solver from './Solver.js';
import Vertex from './Vertex.js';
import Explorer from './Explorer.js';

/** instances
 */
let $$containers;
let $$parentLayer;
let $josekiNextText;
let stage;
let $gusherjs;

/** constants
 */
const solver = new Solver();
const explorer = new Explorer();

/** Course
 */
export default class Course {
	/** .constructor(def, opt)
	 */
	constructor(def, opt) {
		/** インスタンスに代入
		 */
		$$containers = opt.$$gusherLayers;
		$$parentLayer = opt.$$parentLayer;
		stage = opt.stage;
		$gusherjs = opt.$gusherjs;
		/** プロパティ初期化
		 */
		this.def = def;
		this.opt = opt;
		this.gushers = [];
		this.rootVertexes = [];
		this.selectedJosekiId = -1;
		this.latestAppliedJosekiId = null;
		this.josekiNextGusher = null;
		this.isOffJoseki = false;
		this.openedGushers = [];
		this.selectedGusherAlphabets = [];
		this.isUsedWaterVeinGroup = [];
		this.specifyingAnswer = false;
		this.answerGusher = null;
		this.answerGusherAlphabet = '';
		this.isOpenedAnswerGusher = false;
		this.$elementWrapper = $gusherjs.querySelector('#gusherjs-element-wrapper');
		this.measureTextContext = opt.$measureTextCanvas.getContext('2d');
		this.symbolScale = 0.7 / this.def.scale;
		this.$image = new Image();
		this.$image.onload = () => { stage.update(); };
		this.$image.src = def.image;
		// 定義defを解釈する
		this.parseDefine(def);
		// 答えをセットする
		this.setAnswerGusher();
	}

	/** .getElementAgain()
	 * 定義を解釈します。
	 */
	getElementAgain() {
		this.$elementWrapper = $gusherjs.querySelector('#gusherjs-element-wrapper');
	}

	/** .parseDefine(def)
	 * 定義を解釈します。
	 */
	parseDefine(def) {
		// 頂点定義からVertexインスタンスを作成していく
		// 間欠泉頂点については配列gushersに追加する
		def.vertexDefs.forEach((vtxDef, i) => {
			const vtx = new Vertex(vtxDef);
			this.rootVertexes.push(vtx);
			if (vtx.alphabet !== '*') {
				if (! def.excludeGusherStr || def.excludeGusherStr.indexOf(vtx.alphabet) < 0) {
					this.gushers.push(vtx);
				}
			}
		});
		// 除外する間欠泉が指定されている場合(満潮時)
		// 配列suimyakuConnectStrsからその間欠泉を含むデータを除外する
		if (def.excludeGusherStr) {
			const arr = [];
			for (let i = 0; i < def.suimyakuConnectStrs.length; i++) {
				const str = def.suimyakuConnectStrs[i];
				const gusherAStr = str.charAt(0).toUpperCase();
				const gusherBStr = str.charAt(1).toUpperCase();
				if (def.excludeGusherStr.indexOf(gusherAStr) < 0 && def.excludeGusherStr.indexOf(gusherBStr) < 0) {
					arr.push(str);
				}
			}
			def.suimyakuConnectStrs = arr;
		}
		// ルートを接続する
		this.rootVertexes.forEach((vtx, i) => {
			def.vertexDefs[i].rootConnectIds.forEach((id) => {
				vtx.rootConnects.push(this.rootVertexes[id]);
			});
		});
		// ゴールをを接続する
		def.goalConnectStrs.forEach((str) => {
			const split = str.split('-');
			const startGusherStr = split[0];
			const goalGusherStrs = split[1];
			const startGusher = this.getGusher(startGusherStr);
			for (let i = 0; i < goalGusherStrs.length; i++) {
				const goalGusher = this.getGusher(goalGusherStrs[i]);
				startGusher.goalConnects.push(goalGusher);
			}
		});
		// 水脈を接続する
		// 'AB', 'BC', 'CD', ... などのデータからコネクトデータを作成
		def.suimyakuConnectStrs.forEach((str) => {
			const gusherAStr = str.charAt(0).toUpperCase();
			const gusherBStr = str.charAt(1).toUpperCase();
			const gusherA = this.getGusher(gusherAStr);
			const gusherB = this.getGusher(gusherBStr);
			if (gusherA && gusherB) {
				gusherA.suimyakuConnects.push(gusherB);
				gusherB.suimyakuConnects.push(gusherA);
			}
		});
		// "水脈が繋がっていない間欠泉"というデータも持っておく
		this.gushers.forEach((gusher) => {
			this.gushers.forEach((_gusher) => {
				if (gusher !== _gusher) {
					if (gusher.suimyakuConnects.indexOf(_gusher) < 0) {
						gusher.suimyakuNoConnects.push(_gusher);
					}
				}
			});
		});
		// 定石説明欄
		const $textArea = $gusherjs.querySelector('#gusherjs-joseki-text');
		$textArea.classList.add(def.marginPositionX);
		$textArea.classList.add(def.marginPositionY);
		this.applyJoseki(-1);
	}

	/** .applyJoseki(josekiId)
	 * 駐車場をアルファベットから取得します。
	 */
	applyJoseki(josekiId) {
		// selectedJosekiIdの更新
		this.selectedJosekiId = josekiId;
		// 定石説明欄
		const $textArea = $gusherjs.querySelector('#gusherjs-joseki-text');
		// "定石なし"ならば
		if (josekiId < 0) {
			// 次に開けるべき栓を示すテキストを非表示にする
			if ($josekiNextText) $josekiNextText.style.setProperty('display', 'none');
			if ($textArea) $textArea.style.setProperty('display', 'none');
			// 手順一覧を更新する
			this.updateProcedureCatalog();
			this.latestAppliedJosekiId = josekiId;
			return;
		} else if (this.selectedJosekiId !== this.latestAppliedJosekiId) {
			// 定石説明欄のクリア
			while ($textArea.children[0]) {
				$textArea.removeChild($textArea.children[0]);
			}
			const $josekiArea = document.createElement('div');
			$josekiArea.classList.add('joseki-area');
			$textArea.appendChild($josekiArea);
			$textArea.style.setProperty('display', 'block');
			// 定石定義を取得
			const joseki = this.def.josekiDefs[josekiId];
			// 定石に関する部分を初期化
			this.firstGusher = null;
			this.firstGusherAlphabet = null;
			this.gushers.forEach((gusher) => {
				gusher.josekiNexts = [];
				gusher.joken = '';
			});
			// 定石を解釈していく
			let i = 0;
			let lastAlphabet = '';
			const registNexts = (targetGusher, nexts) => {
				let str = '';
				for (let i = 1; i < nexts.length; i++) {
					//str += nexts[i - 1];
					const nextGusher = this.getGusher(nexts[i]);
					const beforeGusher = this.getGusher(nexts[i - 1]);
					nextGusher.joken = beforeGusher.joken + str;
					this.getGusher(nexts[i - 1]).josekiNexts.push({
						joken: '',
						alphabet: nexts[i],
					});
				}
			};
			// 定石定義テキストからタブを除外し改行で区切った配列
			const split = joseki.text.replace(/\t/g, '').split('\n');
			split.forEach((line) => {
				// "__"の数を数える、その数がネストの深さ
				const match = line.match(/__/g);
				const depth = (match) ? match.length : 0;
				// "__"や空白を取り除く
				const trimedLine = line.trim().replace(/__/g, '');
				if (trimedLine) {
					// i === 0 かどうか すなわち初手かどうかで場合分け
					if (i === 0) {
						// 初手ならば
						this.firstGusherAlphabet = trimedLine[0];
						const targetGusher = this.getGusher(trimedLine[0]);
						targetGusher.joken = '';
						registNexts(targetGusher, trimedLine);
					} else {
						// 初手ではないならば
						const a = trimedLine.indexOf('(');
						const b = trimedLine.indexOf(')');
						const c = trimedLine.indexOf(' ');
						// 条件部分（カッコ内の文字列）たとえば "D大G大"
						const joken = trimedLine.substr(a + 1, b - a - 1);
						// 条件より右の部分 たとえば "AC"
						const nexts = trimedLine.substr(c + 1);
						// D大G大ならばACを開ける、という場合、
						// GとAを定石情報で接続する
						// 定石を登録する間欠泉 上記の例だとG
						const targetGusher = this.getGusher(joken.charAt(joken.length - 2));
						// その次に開けるべき間欠泉 上記の例だとA
						const nextGusher = this.getGusher(nexts[0]);
						// 条件テキストを足していく
						if (targetGusher.joken.substr(-1) === joken.substr(0, 1)) {
							nextGusher.joken = targetGusher.joken + joken.substr(1);
						} else {
							nextGusher.joken = targetGusher.joken + joken;
						}
						// targetGusherに定石を追加
						targetGusher.josekiNexts.push({
							joken: joken,
							alphabet: nexts[0],
						});
						// nextsを登録
						registNexts(targetGusher, nexts);
					}
					// 定石説明エリアに<p>を追加
					const $p = document.createElement('p');
					if (this.opt.lang === 'en') {
						$p.textContent = trimedLine
						  .replace(/大/g, constants.GUSHER_STR_BIG_EN)
						  .replace(/小/g, constants.GUSHER_STR_SMALL_EN);
					} else {
						$p.textContent = trimedLine;
					}
					$p.classList.add('joseki');
					$p.style.setProperty('margin-left', (depth * 1) + 'em');
					$josekiArea.appendChild($p);
					i++;
				}
			});
			this.gushers.forEach((gusher) => {
				gusher.jokenStr = {
					'ja': gusher.joken || '初手',
					'en': gusher.joken
					  .replace(/大/g, constants.GUSHER_STR_BIG_EN)
					  .replace(/小/g, constants.GUSHER_STR_SMALL_EN) || 'First'
				};
			});
			if (joseki.more && joseki.more[this.opt.lang]) {
				// more
				const $more = document.createElement('p');
				$more.classList.add('more');
				$more.textContent = 'more';
				$more.addEventListener('click', (e) => {
					$more.style.setProperty('display', 'none');
					Array.prototype.forEach.call($gusherjs.querySelectorAll('#gusherjs-joseki-text .more-content'), ($elm) => {
						$elm.style.setProperty('display', 'block');
					});
				});
				$textArea.appendChild($more);
				// content
				const $content = document.createElement('p');
				$content.classList.add('text');
				$content.classList.add('more-content');
				$content.innerHTML = joseki.more[this.opt.lang];
				$textArea.appendChild($content);
				// close
				const $close = document.createElement('p');
				$close.classList.add('close');
				$close.classList.add('more-content');
				$close.textContent = 'close';
				$close.addEventListener('click', (e) => {
					$more.style.setProperty('display', 'block');
					Array.prototype.forEach.call($gusherjs.querySelectorAll('#gusherjs-joseki-text .more-content'), ($elm) => {
						$elm.style.setProperty('display', 'none');
					});
				});
				$textArea.appendChild($close);
			}
			//
			this.firstGusher = this.getGusher(this.firstGusherAlphabet);
			this.updateProcedureCatalog();
		}
		this.josekiNextGusher = this.firstGusher;
		if ($josekiNextText) {
			$josekiNextText.textContent = this.firstGusher.jokenStr[this.opt.lang];
			$josekiNextText.style.setProperty('display', 'block');
			$josekiNextText.style.setProperty('left', `${this.firstGusher.cx}px`);
			$josekiNextText.style.setProperty('top', `${this.firstGusher.cy}px`);
		}
		stage.update();
		this.latestAppliedJosekiId = josekiId;
	}

	/** .checkJosekiNext()
	 */
	checkJosekiNext() {
		let next = null;
		// console.log('★定石チェック');
		// 開栓されたことがあるかどうかで場合分け
		if (this.openedGushers.length === 0) {
			// 一度も開栓されていない場合
			// firstGusherAlphabetを指定
			next = this.firstGusherAlphabet;
		} else {
			// 開栓されたことがある場合
			// 最後に開栓された栓を取得
			let latestGusher = this.openedGushers[this.openedGushers.length - 1];
			// console.log(`最後に開けられた栓: ${latestGusher.alphabet}`);
			// その栓の次に開けるべき栓の候補がいくつあるかで場合分け
			if (latestGusher.josekiNexts.length === 1) {
				// 候補がひとつしかない場合
				// そのひとつを指定
				next = latestGusher.josekiNexts[0].alphabet;
				// console.log(`条件なし! 次は ${next}`);
			} else if (latestGusher.josekiNexts.length > 1) {
				// 候補が複数ある場合
				// 各候補について条件を満たしているかチェックする
				for (let i = 0; i < latestGusher.josekiNexts.length; i++) {
					const josekiNext = latestGusher.josekiNexts[i];
					// この候補の条件が満たされているか
					let isOK = true;
					// 条件が複数ある場合に対応
					for (let j = 0; j < josekiNext.joken.length; j += 2) {
						// この条件はどうだろう？
						const joken = josekiNext.joken.substr(j, 2);
						// チェック対象の栓
						const alphabet = joken[0];
						const size = joken[1];
						// チェック対象の栓は高くあるべきか？
						const shouldBig = (size === constants.GUSHER_STR_BIG);
						// 実際のところチェック対象の栓は高いのか
						const isBig = this.answerGusher.isConnectTo(alphabet);
						// 条件と実状がマッチしていないならばこの候補はダメだ！
						if (shouldBig !== isBig) {
							isOK = false;
							break;
						}
					}
					// 条件を満たしているならこの候補で決まりだ！
					if (isOK) {
						next = josekiNext.alphabet;
						// console.log(`条件 ${josekiNext.joken} を満たした! 次は ${next}`);
						break;
					}
				};
			}
		}
		return next;
	}

	/** .getGusher(str)
	 * 駐車場をアルファベットから取得します。
	 */
	getGusher(str) {
		// strを数値データにパースしてみる
		const parsed = parseInt(str, 10);
		// パースの結果次第
		if (Number.isNaN(parsed)) {
			// 数値にならなかった(アルファベットだった)場合
			// そのアルファベットが設定された駐車場をして返す
			for (let i = 0; i < this.gushers.length; i += 1) {
				if (this.gushers[i].alphabet === str) {
					return this.gushers[i];
				}
			}
		} else {
			// 数字になった場合それをインデックスにしてgusherを取得
			return this.gushers[parsed];
		}
		// この期に及んで何も返せていないならしょうがないnullを返す
		return null;
	}

	/** .setAnswerGusher(alphabet)
	 */
	setAnswerGusher(alphabet) {
		if (alphabet) {
			this.answerGusherAlphabet = alphabet;
		} else {
			const randomNumber = Math.floor(Math.random() * this.gushers.length);
			const randomAlphabet = this.gushers[randomNumber].alphabet;
			this.answerGusherAlphabet = randomAlphabet;
		}
		this.answerGusher = this.getGusher(this.answerGusherAlphabet);
	}

	/** .updateVisible()
	 */
	getChecked(id) {
		return $gusherjs.querySelector('#' + id).checked;
	}
	updateVisible() {
		$$containers['water-vein'].alpha = (this.getChecked('gusherjs-visible-suimyaku')) ? 1 : 0;
		$$containers['goldie-path'].alpha = (this.getChecked('gusherjs-visible-goldie-path')) ? 1 : 0;
		$$containers['procedure'].alpha = (this.getChecked('gusherjs-visible-procedure')) ? 1 : 0;
		if (this.gushers[0].draw) {
			this.gushers.forEach((gusher) => {
				if (this.isOpenedAnswerGusher) {
					if (this.getChecked('gusherjs-visible-goldie-path') && gusher.isGoalCandidate) {
						gusher.draw(constants.GOLDIE_PATH_COLOR);
					} else {
						gusher.draw();
					}
				} else {
					if (this.getChecked('gusherjs-highlight-candidates') && gusher.isAnswerCandidate) {
						gusher.draw(constants.GUSHER_BGCOLOR_ATARI_CANDIDATE);
					} else {
						gusher.draw();
					}
				}
			});
		}
		stage.update();
		/*
		this.$elementWrapper.classList.remove('show-procedure');
		if (this.getChecked('gusherjs-visible-procedure')) {
			this.$elementWrapper.classList.add('show-procedure');
		}
		*/
	}

	/** .drawGoldiePath()
	 */
	drawGoldiePath() {
		// コンテナのクリア
		while ($$containers['goldie-path'].children.length > 0) {
			$$containers['goldie-path'].removeChild($$containers['goldie-path'].children[0]);
		}
		
		// 当たりの栓から各栓までの最短経路を計算する
		const answerGusher = this.answerGusher;
		this.rootVertexes.forEach((vtx) => {
			vtx.isConnectedStart = false;
			vtx.score = - Infinity;
			vtx.fromVertex = null;
		});
		explorer.go(answerGusher);
		const walkingRoots = [];
		answerGusher.goalConnects.forEach((goalGusher) => {
			goalGusher.isGoalCandidate = true;
			// goalGusher.draw(constants.GOLDIE_PATH_COLOR);
			const vertexes = [];
			let vertex = goalGusher;
			while (vertex !== answerGusher) {
				vertexes.push(vertex);
				vertex = vertex.fromVertex;
			}
			vertexes.push(answerGusher);
			vertexes.reverse();
			walkingRoots.push(vertexes);
		});
		

		/** 矢印の白縁取り
		 */
		/*
		walkingRoots.forEach((vertexes) => {
			const v1 = vertexes[vertexes.length - 2];
			const v2 = vertexes[vertexes.length - 1];
			const $$arrowBorder = utilities.create$$arrow(
				this.opt.assetsPath2 + '/assets/img/walking-root-arrow-border.png',
				v1, v2
			);
		  $$arrowBorder.image.onload = () => {
		  	stage.update();
		  };
			$$containers['goldie-path'].addChild($$arrowBorder);
		});
		*/

		/** 歩行ルートの白縁取り
		 */
		const $$gusherBorder = new createjs.Shape();
		const $$walkingRoot = new createjs.Shape();
		walkingRoots.forEach((vertexes) => {
			$$gusherBorder.graphics
			.setStrokeStyle(constants.GOLDIE_PATH_BORDER_WIDTH * this.symbolScale, 'square')
			.beginStroke('#ffffff')
			.moveTo(vertexes[0].x, vertexes[0].y);
			for (let i = 0; i < vertexes.length - 1; i++) {
				const v1 = vertexes[i];
				const v2 = vertexes[i + 1];
				$$gusherBorder.graphics.lineTo(v2.x, v2.y);
			}
			$$gusherBorder.graphics.endStroke();
		});
		
		/** 間欠泉の縁取り
		 */
		answerGusher.goalConnects.forEach((gusher) => {
		//this.gushers.forEach((gusher) => {
			const add = (gusher.isGoalCandidate) ? 8 : 0;
			const color = (gusher.isGoalCandidate) ? constants.GOLDIE_PATH_COLOR : constants.GUSHER_BORDER_COLOR;
			$$gusherBorder.graphics
			.beginFill(color)
			.drawCircle(gusher.x, gusher.y, (constants.GUSHER_RADIUS + constants.GUSHER_STROKE_WIDTH + constants.BORDER_WIDTH + add) * this.symbolScale)
		});
		$$containers['goldie-path'].addChild($$gusherBorder);

		/** 歩行ルート
		 */
		walkingRoots.forEach((vertexes) => {
			$$walkingRoot.graphics.setStrokeStyle(constants.GOLDIE_PATH_WIDTH * this.symbolScale, 'square')
			.beginStroke(constants.GOLDIE_PATH_COLOR)
			.moveTo(vertexes[0].x, vertexes[0].y);
			for (let i = 0; i < vertexes.length - 1; i++) {
				const v1 = vertexes[i];
				const v2 = vertexes[i + 1];
				if (true || i < vertexes.length - 2) {
					$$walkingRoot.graphics.lineTo(v2.x, v2.y);
				} else {
					const vec = utilities.getRelativeVector(v1, v2);
					const vecLen = Math.sqrt(vec.x ** 2 + vec.y ** 2);
					const newVecLen = vecLen - (50 * this.symbolScale);
					if (newVecLen > 0) {
						const deg = utilities.getVectorAngle(vec);
						const newVec = utilities.getRotatedVector({x: newVecLen, y: 0}, deg);
						const newV2 = {
							x: v1.x + newVec.x,
							y: v1.y + newVec.y,
						};
						$$walkingRoot.graphics.lineTo(newV2.x, newV2.y);
					}
				}
			}
			$$walkingRoot.graphics.endStroke();
		});
		$$containers['goldie-path'].addChild($$walkingRoot);
		
		/** 矢印
		 */
		/*
		walkingRoots.forEach((vertexes) => {
			const v1 = vertexes[vertexes.length - 2];
			const v2 = vertexes[vertexes.length - 1];
			const $$arrow = utilities.create$$arrow(
				this.opt.assetsPath2 + '/assets/img/walking-root-arrow.png',
				v1, v2
			);
		  $$arrow.image.onload = () => {
		  	stage.update();
		  };
			$$containers['goldie-path'].addChild($$arrow);
		});
		*/
	}

	/** .drawWaterVeinGroup()
	 */
	drawWaterVeinGroup(alphabet) {
		while ($$containers['water-vein-group'].children.length > 0) {
			$$containers['water-vein-group'].removeChild($$containers['water-vein-group'].children[0]);
		}
		if (this.getChecked('gusherjs-mode-check-water-vein-a')) {
			this.gushers.forEach((gusher) => {
				gusher.draw();
			});
			const $$waterVeins = [];
			const $$waterVeinBorders = [];
			[
				{
					arr: $$waterVeins,
					color: null,
					lineCount: {},
					radiusCount: {},
					margin: 0,
				},
				{
					arr: $$waterVeinBorders,
					color: constants.WATER_VEIN_BORDER_COLOR,
					lineCount: {},
					radiusCount: {},
					margin: 15,
				},
			].forEach((opt) => {
				this.selectedGusherAlphabets.forEach((alphabet) => {
					const gusher = this.getGusher(alphabet);
					opt.radiusCount[gusher.alphabet] = 39;
				});
				this.selectedGusherAlphabets.forEach((alphabet) => {
					const gusher = this.getGusher(alphabet);
					const color = opt.color || constants.WATER_VEIN_GROUP_COLORS[gusher.waterVeinGroupColorIndex % constants.WATER_VEIN_GROUP_COLORS.length];
					const $$waterVein = new createjs.Shape();
					gusher.suimyakuConnects.forEach((gusher2) => {
						let key = gusher.alphabet + gusher2.alphabet;
						if (key.charCodeAt(0) > key.charCodeAt(1)) {
							key = key.charAt(1) + key.charAt(0);
						}
						if (key in opt.lineCount) {
							opt.lineCount[key]++;
						} else {
							opt.lineCount[key] = 0;
						}
						if (! (gusher2.alphabet in opt.radiusCount)) {
							opt.radiusCount[gusher2.alphabet] = constants.GUSHER_RADIUS + constants.GUSHER_STROKE_WIDTH + 2;
						}
						$$waterVein.graphics
						.setStrokeStyle((15 + 30 * opt.lineCount[key]) * this.symbolScale, 'square')
						.beginStroke(color)
						.moveTo(gusher.x, gusher.y)
						.lineTo(gusher2.x, gusher2.y)
						.endStroke()
						.beginFill(color)
						.drawCircle(gusher2.x, gusher2.y, (opt.radiusCount[gusher2.alphabet] += 10) * this.symbolScale + opt.margin * this.symbolScale);
					});
					if (! (gusher.alphabet in opt.radiusCount)) {
						opt.radiusCount[gusher.alphabet] = constants.GUSHER_RADIUS + constants.GUSHER_STROKE_WIDTH + constants.BORDER_WIDTH;
					}
					if (! opt.color) {
						gusher.draw(color, 1.5);
					}
					/*
					$$waterVein.graphics
					.beginFill(color)
					.drawCircle(gusher.x, gusher.y, (opt.radiusCount[gusher.alphabet] += 15) * this.symbolScale + opt.margin * this.symbolScale);
					*/
					opt.arr.push($$waterVein);
				});
			});
			$$waterVeinBorders.reverse().forEach(($$waterVein) => {
				$$containers['water-vein-group'].addChild($$waterVein);
			});
			$$waterVeins.reverse().forEach(($$waterVein) => {
				$$containers['water-vein-group'].addChild($$waterVein);
			});
		} else {
			this.selectedGusherAlphabets.forEach((alphabet, i, arr) => {
				const gusher = this.getGusher(alphabet);
				const color = constants.WATER_VEIN_GROUP_COLORS[i % constants.WATER_VEIN_GROUP_COLORS.length];
				const $$waterVein = new createjs.Shape();
				const margin = 40 + i * 10;
				const vertexes = [gusher, ...gusher.suimyakuConnects];
				const centerVertex = solver.getCenterPoint(vertexes);
				const extendedVertexes = [];
				vertexes.forEach((vertex) => {
					const addLen = margin * this.symbolScale;
					const vector = utilities.getRelativeVector(centerVertex, vertex);
					const newVector = utilities.getExtendedVector(vector, addLen);
					extendedVertexes.push({
						x: centerVertex.x + newVector.x,
						y: centerVertex.y + newVector.y,
					});
				});
				const solvedVertexes = solver.solve(extendedVertexes);
				$$waterVein.graphics
				.clear()
				.setStrokeStyle(10, 'square')
				.beginStroke(color)
				.moveTo(solvedVertexes[0].x, solvedVertexes[0].y);
				solvedVertexes.forEach((vertex) => {
					$$waterVein.graphics.lineTo(vertex.x, vertex.y)
				});
				$$waterVein.graphics
				.lineTo(solvedVertexes[0].x, solvedVertexes[0].y)
				.endStroke();
				$$waterVein.graphics
				.beginFill(color)
				.drawCircle(gusher.x, gusher.y, (constants.GUSHER_RADIUS + constants.GUSHER_STROKE_WIDTH + constants.BORDER_WIDTH + 15) * this.symbolScale);
				$$containers['water-vein-group'].addChild($$waterVein);
			});
		}
		stage.update();
	}

	/** .updateProcedureCatalog()
	 */
	updateProcedureCatalog() {
		// その間欠泉を開ける条件
		/*
		const $jokens = document.querySelectorAll('.joken');
		Array.prototype.forEach.call($jokens, ($joken) => {
			$joken.parent.removeChild($joken);
		});
		this.gushers.forEach((gusher) => {
			const $joken = document.createElement('p');
			let html = '';
			let size = null;
			let jokenStr = gusher.joken || '初手';
			jokenStr = jokenStr.replace(/大/g, '▌');//▖▌ █ ▃
			jokenStr = jokenStr.replace(/小/g, '▖');
			html = jokenStr;
			if (gusher.joken) {
				for (let i = gusher.joken.length - 1; i >= 0; i--) {
					const c = gusher.joken[i];
					if (c === constants.GUSHER_STR_BIG) {
						size = 'big';
					} else if (c === constants.GUSHER_STR_SMALL) {
						size = 'small';
					} else {
						if (size) {
							html = `<span class="${size}">${c}</span>` + html;
							size = null;
						} else {
							html = `<span>${c}</span>` + html;
						}
					}
				}
			} else {
				html = '初手';
			}
			$joken.classList.add('joken');
			$joken.innerHTML = html;
			$joken.style.setProperty('left', `${gusher.cx}px`);
			$joken.style.setProperty('top', `${gusher.cy}px`);
			if (! gusher.joken) {
				$joken.style.setProperty('display', 'none');
			}
			this.$elementWrapper.appendChild($joken);
		});
		return;
		*/
		while ($$containers['procedure'].children.length > 0) {
			$$containers['procedure'].removeChild($$containers['procedure'].children[0]);
		}
		if (this.selectedJosekiId < 0) {
			return;
		}
		const labelStyle = `bold ${(32 * this.symbolScale).toFixed(0)}px sans-serif`;
		const jokenSize = Math.floor(20 * this.symbolScale);
		const jokenPadding = Math.floor(10 * this.symbolScale);
		const jokenMargin = Math.floor(50 * this.symbolScale);
		this.measureTextContext.font = `bold ${jokenSize}px sans-serif`;

		this.gushers.forEach((gusher) => {

			// その間欠泉を開ける条件の背景
			let jokenStr = gusher.jokenStr[this.opt.lang];
			const margin = (jokenStr.substr(-1) === '▌' || jokenStr.substr(-1) === '▖') ? -5 : 0;
			const jokenWidth = Math.ceil(this.measureTextContext.measureText(jokenStr).width) + margin;
			const $$jokenBg = new createjs.Shape();
			$$jokenBg.graphics
			.beginFill('rgba(255, 255, 0, 1)')
			.drawRect(
				gusher.x - jokenWidth / 2 - jokenPadding,
				gusher.y + jokenMargin - (jokenSize) / 2 - jokenPadding,
				jokenWidth + jokenPadding * 2,
				jokenSize + jokenPadding * 2,
			);
			$$containers['procedure'].addChild($$jokenBg);

			// その間欠泉を開ける条件のテキスト
			const $$joken = new createjs.Text(
				jokenStr,
				`bold ${jokenSize}px sans-serif`,
				'#000000',
			);
			$$joken.textAlign = 'center';
			$$joken.textBaseline = 'middle';
			$$joken.x = gusher.x - margin;
			$$joken.y = gusher.y + jokenMargin;
			$$containers['procedure'].addChild($$joken);
		});

	}

	/** .beginSpecifying()
	 * 描画します。
	 */
	beginSpecifying() {
		if (this.specifyingAnswer) {
			return this.finishSpecifing();
		}
		this.specifyingAnswer = true;
		$gusherjs.querySelector('#gusherjs-please-specify').style.setProperty('display', 'block');
		$gusherjs.querySelector('#gusherjs-specify-result').style.setProperty('display', 'none');
	}

	/** .finishSpecifing()
	 * 描画します。
	 */
	finishSpecifing() {
		this.specifyingAnswer = false;
		$gusherjs.querySelector('#gusherjs-please-specify').style.setProperty('display', 'none');
	}

	/** .reset(bool)
	 * 描画します。
	 */
	reset(bool) {
		this.gushers.forEach((gusher) => {
			gusher.$$big.alpha = 0;
			gusher.$$small.alpha = 0;
			gusher.$$answer.alpha = 0;
			gusher.isAnswerCandidate = false;
			gusher.isGoalCandidate = false;
			gusher.draw();
		});
		this.finishSpecifing();
		this.openedGushers = [];
		this.selectedGusherAlphabets = [];
		this.isUsedWaterVeinGroup = [];
		this.isOpenedAnswerGusher = false;
		while ($$containers['goldie-path'].children.length > 0) {
			$$containers['goldie-path'].removeChild($$containers['goldie-path'].children[0]);
		}
		while ($$containers['water-vein-group'].children.length > 0) {
			$$containers['water-vein-group'].removeChild($$containers['water-vein-group'].children[0]);
		}
		while ($$containers['gushers-border'].children.length > 0) {
			$$containers['gushers-border'].removeChild($$containers['gushers-border'].children[0]);
		}
		const $$gusherBorder = new createjs.Shape();
		this.gushers.forEach((gusher) => {
			$$gusherBorder.graphics
			.beginFill(constants.GUSHER_BORDER_COLOR)
			.drawCircle(gusher.x, gusher.y, (constants.GUSHER_RADIUS + constants.GUSHER_STROKE_WIDTH + constants.BORDER_WIDTH) * this.symbolScale)
		});
		$$containers['gushers-border'].addChild($$gusherBorder);
		this.isOffJoseki = false;
		this.applyJoseki(this.selectedJosekiId);
		if (bool) {
			this.setAnswerGusher();
		}
		stage.update();
	}

	/** .makeGusher(gusher)
	 */
	makeGusher(gusher) {

		/** 間欠泉のアルファベット(DOM)
		 */
		// const $label = document.createElement('p');
		// $label.classList.add('label');
		// $label.textContent = gusher.alphabet;
		// $label.style.setProperty('left', `${cx}px`);
		// $label.style.setProperty('top', `${cy}px`);
		// this.$elementWrapper.appendChild($label);

		/** 間欠泉
		 */
		const $$gusher = new createjs.Shape();
		$$gusher.x = gusher.x;
		$$gusher.y = gusher.y;
		gusher.draw = (color, ratio = 1) => {
			$$gusher.graphics
			.clear()
			//.beginFill(constants.BORDER_COLOR)
			//.drawCircle(0, 0, (constants.GUSHER_RADIUS + constants.GUSHER_STROKE_WIDTH + constants.BORDER_WIDTH) * this.symbolScale)
			.beginFill(constants.GUSHER_STROKE_COLOR)
			.drawCircle(0, 0, (constants.GUSHER_RADIUS * ratio + constants.GUSHER_STROKE_WIDTH) * this.symbolScale)
			.beginFill(color || constants.GUSHER_BGCOLOR)
			.drawCircle(0, 0, (constants.GUSHER_RADIUS * ratio) * this.symbolScale);
		};
		gusher.draw();
		$$containers['gushers'].addChild($$gusher);
		gusher.$$gusher = $$gusher;

		/** small/big/answerの画像
		 */
		['small', 'big', 'answer'].forEach((name) => {
			const $$bitmap = new createjs.Bitmap(this.opt.$gusherImages[name]).set({
				x: gusher.x,
				y: gusher.y,
				regX: 60,
				regY: 128,
				scale: this.symbolScale * 1.4,
				alpha: 0,
			});
			$$containers['gushers'].addChild($$bitmap);
			gusher['$$' + name] = $$bitmap;
		});

		/** 間欠泉のアルファベット
		 */
		[
			[-1, -1],
			[ 1, -1],
			[ 1,	1],
			[-1,	1],
			[ 0, -1],
			[ 1,	0],
			[ 0,	1],
			[-1,	0],
			[ 0,	0],
		].forEach((dir, i, arr) => {
			const labelStyle = `bold ${(32 * this.symbolScale).toFixed(0)}px sans-serif`;
			const $$label = new createjs.Text(
				gusher.alphabet, labelStyle,
				(i === arr.length - 1) ? constants.GUSHER_LABEL_COLOR : constants.GUSHER_LABEL_BORDER_COLOR,
			);
			$$label.textAlign = 'center';
			$$label.textBaseline = 'middle';
			$$label.x = gusher.x + dir[0] * this.symbolScale * 2;
			$$label.y = gusher.y + dir[1] * this.symbolScale * 2;
			$$containers['gushers'].addChild($$label);
		});
		
		/** 間欠泉のクリックイベント
		 */
		$$gusher.set({ cursor: 'pointer' });
		$$gusher.on('mousedown', () => {
			/** キンシャケルートを見るモード
			 */
			if (this.getChecked('gusherjs-mode-check-goldie-path')) {
				this.answerGusher.$$answer.alpha = 0;
				gusher.$$answer.alpha = 1;
				this.setAnswerGusher(gusher.alphabet);
				this.drawGoldiePath();
			} else if (this.getChecked('gusherjs-mode-check-water-vein-a')) {
			/** 水脈を見るモード
			 */
				const idx = this.selectedGusherAlphabets.indexOf(gusher.alphabet);
				if (idx > -1) {
					this.selectedGusherAlphabets.splice(idx, 1);
					this.isUsedWaterVeinGroup[gusher.waterVeinGroupColorIndex] = false;
					gusher.waterVeinGroupColorIndex = -1;
				} else {
					this.selectedGusherAlphabets.push(gusher.alphabet);
					let i;
					for (i = 0; i < this.isUsedWaterVeinGroup.length; i++) {
						if (! this.isUsedWaterVeinGroup[i]) {
							break;
						}
					}
					this.isUsedWaterVeinGroup[i] = true;
					gusher.waterVeinGroupColorIndex = i;
				}
				this.drawWaterVeinGroup();
			} else if (this.getChecked('gusherjs-mode-seeking-goldie')) {
			/** キンシャケを探すモード
			 */
			 	// ゴールを指定するとき
			 	if (this.specifyingAnswer) {
			 		this.setAnswerGusher(gusher.alphabet);
					const $result = $gusherjs.querySelector('#gusherjs-specify-result');
					$result.querySelector('span.alphabet').textContent = gusher.alphabet;
					$result.style.setProperty('left', gusher.cx + 'px');
					$result.style.setProperty('top', gusher.cy + 'px');
					$result.style.setProperty('display', 'block');
					clearTimeout($result.timerId);
					$result.timerId = setTimeout(() => {
						$result.style.setProperty('display', 'none');
					}, 800);
			 		this.finishSpecifing();
			 		this.reset();
			 		return;
			 	}
			 	// すでに開いている栓を再びクリックしたときは何もしない
				if (this.openedGushers.indexOf(gusher) > -1) {
			 		// console.log('この栓はすでに開いているよ');
			 		return;
			 	}
			 	// すでに当たりが見つかっているときに他の栓を開けたとき
			 	if (this.isOpenedAnswerGusher) {
			 		// console.log('すでに当たりが見つかっているよ');
			 	}
			 	// 定石が選択されているのに、指示されていない栓を開けた場合
				if (this.selectedJosekiId > -1 && this.josekiNextGusher.alphabet !== gusher.alphabet) {
					this.isOffJoseki = true;
				}
				// 開栓の結果を取得する
				// answer/big/smallの3通り
				const result = (gusher.alphabet === this.answerGusherAlphabet)
					? 'answer'
					: (this.answerGusher.isConnectTo(gusher.alphabet))
						? 'big'
						: 'small';
				// 結果ごとに別の画像を表示する
				switch (result) {
					case 'answer':
						gusher.$$answer.alpha = 1;
						this.isOpenedAnswerGusher = true;
						break;
					case 'big':
						gusher.$$big.alpha = 1;
					case 'small':
						gusher.$$small.alpha = 1;
						break;
				}
				// この栓を開栓済みの間欠泉として登録する
				if (this.openedGushers.indexOf(gusher) < 0) {
					this.openedGushers.push(gusher);
				}
				// これまでの開栓によって候補はどこまで絞られただろうか？
				if (this.isOpenedAnswerGusher) {
					// 開栓結果が当たりならば
					// すべてにfalseを代入する
					this.gushers.forEach((_gusher) => {
						_gusher.isAnswerCandidate = false;
					});
				} else {
					// 開栓結果が当たりでなければ
					// いったんすべてにtrueを代入してから一部をfalseにすることを考える
					this.gushers.forEach((_gusher) => {
						_gusher.isAnswerCandidate = true;
					});
					// 開栓済みの間欠泉それぞれについて
					this.openedGushers.forEach((_gusher) => {
						// 開栓済みの間欠泉は当然候補から外れるのでfalse
						_gusher.isAnswerCandidate = false;
						// その栓が高いか低いかで場合分け
						if (this.answerGusher.isConnectTo(_gusher.alphabet)) {
							// 高いならば、そこと接続されていない駐車場を候補から外す
							_gusher.suimyakuNoConnects.forEach((__gusher) => {
								__gusher.isAnswerCandidate = false;
							});
						} else {
							// 低いならば、そこと接続されている駐車場を候補から外す
							_gusher.suimyakuConnects.forEach((__gusher) => {
								__gusher.isAnswerCandidate = false;
							});
						}
					});
				}
				// 候補が絞り込まれた！
				// 駐車場を描画しなおす
				const answerCandidateColor = (this.getChecked('gusherjs-highlight-candidates'))
					? constants.GUSHER_BGCOLOR_ATARI_CANDIDATE
					: constants.GUSHER_BGCOLOR;
				this.gushers.forEach((_gusher) => {
					if (_gusher.isAnswerCandidate) {
						_gusher.draw(answerCandidateColor);
					} else {
						_gusher.draw();
					}
				});

				// 当たりが出ているかどうかで場合分け
				if (this.isOpenedAnswerGusher) {
					// 当たりが出ているならば
					if ($josekiNextText) {
						$josekiNextText.style.setProperty('display', 'none');
					}
					this.drawGoldiePath();
				} else {
					// 当たりが出ていないならば
					if (this.selectedJosekiId > -1) {
						if (this.isOffJoseki) {
							if ($josekiNextText) {
								$josekiNextText.style.setProperty('display', 'none');
							}
						} else {
							const next = this.checkJosekiNext();
							if (next) {
								const nextGusher = this.getGusher(next);
								this.josekiNextGusher = nextGusher;
								if ($josekiNextText) {
									$josekiNextText.textContent = nextGusher.jokenStr[this.opt.lang];
									$josekiNextText.style.setProperty('display', 'block');
									$josekiNextText.style.setProperty('left', `${nextGusher.cx}px`);
									$josekiNextText.style.setProperty('top', `${nextGusher.cy}px`);
								}
							}
						}
					}
				}
			}
			// ステージのアップデート
			stage.update();
		});
	}

	/** .draw()
	 * 描画します。
	 */
	draw() {

		// この間欠泉の<canvas>上の座標を計算しておく
		this.gushers.forEach((gusher) => {
			gusher.cx = this.opt.width / 2 + this.def.scale * ((gusher.x - this.def.width / 2) + (this.def.width / 2 - this.def.centerX));
			gusher.cy = this.opt.height / 2 + this.def.scale * ((gusher.y - this.def.height / 2) + (this.def.height / 2 - this.def.centerY));
		});

		/** 親レイヤーにスケールや回転をセット
		 */
		$$parentLayer.set({
			rotation: this.def.rotation,
			scale: this.def.scale,
			regX: this.def.width / 2,
			regY: this.def.height / 2,
			x: this.opt.width / 2 + this.def.scale * (this.def.width / 2 - this.def.centerX),
			y: this.opt.height / 2 + this.def.scale * (this.def.height / 2 - this.def.centerY),
			//x: this.def.x - this.def.scale * this.def.width / 2,
			//y:  this.def.y - this.def.scale * this.def.height / 2,
		});
		

		/** コース画像
		 */
		const $$backgroundImage = new createjs.Bitmap(this.$image).set({});
		$$containers['base'].addChild($$backgroundImage);

		/** 定石の矢印
		 */
		$josekiNextText = $gusherjs.querySelector('#gusherjs-joseki-next');

		/** 水脈
		 */
		const $$waterVein = new createjs.Shape();
		[
			{
				color: constants.BORDER_COLOR, 
				width: constants.WATER_VEIN_WIDTH + (constants.BORDER_WIDTH * 2), 
			},
			{
				color: constants.WATER_VEIN_COLOR, 
				width: constants.WATER_VEIN_WIDTH,
			},
		].forEach((opt) => {
			this.def.suimyakuConnectStrs.forEach((line) => {
				const alphabet1 = line.charAt(0).toUpperCase();
				const alphabet2 = line.charAt(1).toUpperCase();
				const gusher1 = this.getGusher(alphabet1);
				const gusher2 = this.getGusher(alphabet2);
				$$waterVein.graphics
				.setStrokeStyle(opt.width, 'square')
				.beginStroke(opt.color)
				.moveTo(gusher1.x, gusher1.y)
				.lineTo(gusher2.x, gusher2.y)
				.endStroke();
			});
		});
		$$containers['water-vein'].addChild($$waterVein);

		/** 間欠泉のボーダー
		 */
		const $$gusherBorder = new createjs.Shape();
		this.gushers.forEach((gusher) => {
			$$gusherBorder.graphics
			.beginFill(constants.GUSHER_BORDER_COLOR)
			.drawCircle(gusher.x, gusher.y, (constants.GUSHER_RADIUS + constants.GUSHER_STROKE_WIDTH + constants.BORDER_WIDTH) * this.symbolScale)
		});
		$$containers['gushers-border'].addChild($$gusherBorder);

		/** 間欠泉
		 */
		this.gushers.forEach((gusher) => {
			this.makeGusher(gusher);
		});

		if (this.selectedJosekiId > -1) {
			$arrow.style.setProperty('left', `${this.getGusher(this.firstGusherAlphabet).cx}px`);
			$arrow.style.setProperty('top', `${this.getGusher(this.firstGusherAlphabet).cy}px`);
		}

		stage.update();
	}
	
	/** .test()
	 */
	test() {}
}
