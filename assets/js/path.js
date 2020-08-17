(() => {
	/** CONSTANTS
	 */
	const CANVAS_WIDTH = 2000;
	const CANVAS_HEIGHT = 2000;
	const DIRS_4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];
	const DIRS_5 = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
	const DIRS_8 = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [1, -1], [-1, 1]];
	const COLOR_TYPE_EMPTY = Symbol('empty');
	const COLOR_TYPE_GUSHER_VERTEX = Symbol('gusher');
	const COLOR_TYPE_ROOT_VERTEX = Symbol('root-vertex');
	const COLOR_TYPE_ROOT_CONNECT = Symbol('root-side');
	const COLOR_TYPE_ROOT_CONNECT_2 = Symbol('root-side-2');
	const COLOR_TYPE_ROOT_CONNECT_3 = Symbol('root-side-3');

	/** INSTANCES
	 */
	let stage;
	let pathData;

	/** createVertexesFromDefs(vertexDefs, connectDefs, type)
	 */
	const createVertexesFromDefs = (vertexDefs, connectDefs, type) => {
		// 頂点配列を作成
		const vertexes = [];
		vertexDefs.forEach((def, i) => {
			vertexes.push(new Vtx2(...def, i, type, vertexes));
		});
		const allLines = [];
		const twowayLines = [];
		const onewayLines = [];
		const twowayLineStrs = [];
		const onewayLineStrs = [];
		// 頂点の関係性を作成
		connectDefs.forEach((def, i) => {
			// '*'が付いていれば一方通行とみなす
			const isOneway = (def.indexOf('*') > -1);
			const _def = def.replace('*', '').split('-');
			for (let i = 1; i < _def.length; i += 1) {
				let charA = _def[i - 1];
				let charB = _def[i];
				let indexA = parseInt(charA, 10);
				let indexB = parseInt(charB, 10);
				let lineStrAB = charA + '-' + charB;
				let lineStrBA = charB + '-' + charA;
				let vertexA = vertexes[indexA];
				let vertexB = vertexes[indexB];
				let line = [
					vertexA,
					vertexB
				];
				if (isOneway) {
					// 一方通行フラグが立っていれば
					vertexA.connectTo(		vertexB);
					//vertexA.connectedFrom(vertexB);
					//vertexB.connectTo(		vertexA);
					vertexB.connectedFrom(vertexA);
				} else {
					vertexA.connectTo(		vertexB);
					vertexA.connectedFrom(vertexB);
					vertexB.connectTo(		vertexA);
					vertexB.connectedFrom(vertexA);
				}
				// twowayLineStrs / onewayLineStrsに登録する
				if (isOneway) {
					if (onewayLineStrs.indexOf(lineStrAB) < 0) {
						onewayLineStrs.push(lineStrAB);
						onewayLines.push(line);
						allLines.push(line);
					}
				} else {
					if (twowayLineStrs.indexOf(lineStrAB) < 0 && twowayLineStrs.indexOf(lineStrBA) < 0) {
						twowayLineStrs.push(lineStrAB);
						twowayLines.push(line);
						allLines.push(line);
					}
				}
			}
		});
		return [vertexes, twowayLines, onewayLines];
	};

	/** createPathDataFromDefs(pathDataDefs)
	 */
	const createPathDataFromDefs = (pathDataDefs) => {
		const [
			rootVertexes,
			rootTLines,
			rootOLines,
		] = createVertexesFromDefs(
			pathDataDefs.rootVertexDefs,
			pathDataDefs.rootConnectDefs,
			COLOR_TYPE_VERTEX,
		);
		const [
			wallVertexes,
			wallTLines,
			wallOLines,
		] = createVertexesFromDefs(
			pathDataDefs.wallVertexDefs,
			pathDataDefs.wallConnectDefs,
			COLOR_TYPE_WALL_VERTEX,
		);
		return {
			rootVertexes,
			rootTLines,
			rootOLines,
			rootLineStrs: pathDataDefs.rootConnectDefs,
			wallVertexes,
			wallTLines,
			wallOLines,
			wallLineStrs: pathDataDefs.wallConnectDefs,
			unionAreas: pathDataDefs.unionAreaDefs || [],
		};
	}

	/** createPathDataFromImage(image, tryCount)
	 * @param {String|Element} image - 画像ファイルの場所、あるいは<img>要素
	 * @param {Number} tryCount - 再帰回数
	 */
	const createPathDataFromImage = (image, tryCount = 0) => new Promise((resolve) => {
		let $image;
		// imageが文字列かどうか
		if (typeof image === 'string') {
			// 文字列なら<img>要素を作ってsrcにぶち込む
			$image = document.createElement('img');
			$image.src = image;
		} else {
			// 文字列ではないなら<img>要素と解釈して代入
			$image = image;
		}
		// この時点で$imageには<img>要素が入っている
		// naturalWidthが取得できないならば
		if ($image.naturalWidth === 0) {
			// 画像の読み込みが完了していないようだ！これでは作業できない
			// tryCountが0か？
			if (tryCount === 0) {
				// tryCountが0ならば画像読み込み完了イベントにハンドラを取り付ける
				$image.addEventListener('load', () => {
					// <img>要素を第一引数にして、tryCountを1増やしながら再帰する
					resolve(createPathDataFromImage($image, 1));
				}, { once: true });
				// ここで帰ろう
				return;
			}
			// tryCountが1以上なのにnaturalWidthが取れないというのは変だ
			console.log('error!');
			// ここで帰ろう
			return;
		}
		// 画像の読み込みが完了しているようだ！
		// 画像と同じ大きさの<canvas>要素を作成する
		const $canvas = document.createElement('canvas');
		const width = $image.naturalWidth;
		const height = $image.naturalHeight;
		$canvas.setAttribute('width', width);
		$canvas.setAttribute('height', height);
		const ctx = $canvas.getContext('2d');
		// 画像を描画する
		ctx.drawImage($image, 0, 0, width, height);
		// イメージデータを作る
		const imagedata = ctx.getImageData(0, 0, width, height);
		// 道頂点群と壁頂点群をサーチ
		const [allVertexes, gusherVertexes, rootVertexes] = searchVertexes(imagedata);
		// 道頂点群について接続をチェック
		const [lineStrs, allLines] = checkConnect(imagedata, allVertexes);
		// 結果を返す
		resolve({
			allVertexes,
			gusherVertexes,
			rootVertexes,
			lineStrs,
			allLines,
		});
	});

	/** Vtx(id, pixels, arounds, type) 
	 */
	const Vtx = function Vtx(id, pixels, arounds, type) {
		this.id = id;
		this.type = type;
		this.pixels = pixels;
		this.arounds = arounds;
		let num = 0;
		let xSum = 0;
		let ySum = 0;
		this.xMin = Infinity;
		this.yMin = Infinity;
		this.xMax = -Infinity;
		this.yMax = -Infinity;
		pixels.forEach((p) => {
			xSum += p.x;
			ySum += p.y;
			if (p.x < this.xMin) this.xMin = p.x;
			if (p.y < this.yMin) this.yMin = p.y;
			if (p.x > this.xMax) this.xMax = p.x;
			if (p.y > this.yMax) this.yMax = p.y;
			num += 1;
		});
		this.width = this.xMax - this.xMin;
		this.height = this.yMax - this.yMin;
		this.radius = Math.floor((this.xMax - this.xMin) / 2);
		this.x = Math.floor(xSum / num);
		this.y = Math.floor(ySum / num);
		this.connects = [];
	};

	/** .connectTo(vtx)
	 */
	Vtx.prototype.connectTo = function connectTo(vtx) {
		if (this.connects.indexOf(vtx) < 0) {
			this.connects.push(vtx);
		}
		if (vtx.connects.indexOf(this) < 0) {
			vtx.connects.push(this);
		}
	};

	/** .drawVertex()
	 */
	Vtx.prototype.drawVertex = function drawVertex(color, size, noText) {
		if (! size) size = 6;
		const str = (this.gusherIndex !== undefined) ? `[${String.fromCharCode(('A').charCodeAt() + this.gusherIndex)}]${this.id}` : this.id;
		if (! color) {
			if (this.type === COLOR_TYPE_GUSHER_VERTEX) {
				color = 'green';
			} else if (this.type === COLOR_TYPE_ROOT_VERTEX) {
				color = 'blue';
			} else {
				color = 'black';
			}
		}
		const $$container = new createjs.Container();
		$$container.x = this.x;
		$$container.y = this.y;
		const $$text = new createjs.Text(str, '14px sans-serif', '#000');
		$$text.textBaseline = 'middle';
		$$text.textAlign = 'center';
		$$text.x = 12;
		$$text.y = 12;
		const $$shape = new createjs.Shape();
		//$$shape.graphics.beginFill(color).drawCircle(0, 0, size);
		$$shape.graphics.beginFill(color).rect(-size, -size, size*2, size*2);
		stage.addChild($$container);
		$$container.addChild($$shape);
		if (! noText) {
			$$container.addChild($$text);
		}
		this.$$objects = [$$text, $$shape];
		let isCatch = false;
		let marginX = 0;
		let marginY = 0;
		$$container.cursor = 'pointer';
		$$container.on('mousedown', () => {
			isCatch = true;
			marginX = stage.mouseX - $$container.x;
			marginY = stage.mouseY - $$container.y;
		});
		$$container.on('pressmove', () => {
			if (isCatch) {
				this.x = stage.mouseX - marginX;
				this.y = stage.mouseY - marginY;
				$$container.x = this.x;
				$$container.y = this.y;
				myUpdate();
			}
		});
		$$container.on('pressup', () => {
			isCatch = false;
		});
	};

	/** .drawLine()
	 */
	Vtx.prototype.drawLine = function drawLine(vtxA, vtxB, color = '#000', weight = 1) {
		// Shapeインスタンスを作成
		const shape = new createjs.Shape();
		// draw関数を生成する
		const draw = this.createLineDrawer(
			shape.graphics, vtxA, vtxB, weight
		);
		// 1回描く
		draw(color);
		// Stageに追加、zindexは最低にする
		stage.addChild(shape);
		stage.setChildIndex(shape, 0);
		return shape;
	};
	/** .createLineDrawer(g, vtxA, vtxB, weight)
	 */
	Vtx.prototype.createLineDrawer = function createLineDrawer(g, vtxA, vtxB, weight) {
		const harf = getHarfVector(vtxA, vtxB);
		const draw = (col) => {
			g.setStrokeStyle(weight);
			g.beginStroke(col);
			g.moveTo(vtxA.x, vtxA.y);
			g.lineTo(vtxB.x, vtxB.y);
			g.endStroke();
		};
		return draw;
	};

	/** createVertexSearcher(imagedata)
	 */
	function createVertexSearcher(imagedata) {
		// すべてのピクセルに「訪れたことがあるかどうか」のフラグを用意する
		const visitedPixels = createArray(imagedata.width, imagedata.height, false);

		/** search(x, y, depth, pixels, arounds, searchingColorType)
			 * @param {Number} x - x座標 0～width-1
			 * @param {Number} y - y座標 0～height-1
			 * @param {Number} depth - 再帰回数
			 * @param {Array} pixels - 頂点のピクセル座標配列
			 * @param {Array} arounds - 頂点の周辺のピクセル座標配列
			 * @param {Symbol} searchingColorType - 現在探そうとしている頂点カラータイプ
			 */
		return function* search(x, y, depth, pixels, arounds, searchingColorType) {
			// このピクセルのカラータイプを取得
			const colorType = getColorType(imagedata, x, y);
			// 頂点であるかどうか
			const isVertex = (colorType === COLOR_TYPE_ROOT_VERTEX)
					|| (colorType === COLOR_TYPE_GUSHER_VERTEX);
			// 深さ0で、頂点であるかどうか
			const isInitialVertex = (depth === 0) && isVertex;
			// 深さ1以上で、探し求めている頂点であるかどうか
			const isSearchingVertex = (depth > 0) && (colorType === searchingColorType);
			// 初めての頂点でもないし、探し求めている頂点でもないならば
			if (!(isInitialVertex || isSearchingVertex)) {
				// ここは無意味なピクセルのようだ！
				// 深さ1以上なら、ここは頂点の周辺ピクセル、ということになる
				if (depth > 0) {
					arounds.push({ x, y });
				}
				// colorTypeを返して終わり
				return colorType;
			}
			// ここに訪れたことがあるならカラータイプを返して終わる
			if (visitedPixels[y][x]) {
				return colorType;
			}
			// ここには訪れたことがないようだ！
			// フラグを立ててやろう
			visitedPixels[y][x] = true;
			// ここは初めての頂点であるか深さ1以上で探し求めていた頂点ピクセル、
			// つまり探索を続ける価値のあるピクセルのようだ！
			// とりあえずここを頂点ピクセルに追加
			pixels.push({ x, y });
			// 上下左右を探索する
			for (const [dx, dy] of DIRS_4) {
				// 次の場所
				const nx = x + dx;
				const ny = y + dy;
				// はみ出したら次の方向へ
				if (nx < 0 || ny < 0 || nx >= imagedata.width || ny >= imagedata.height) {
					continue;
				}
				// はみ出してはいないようだ！
				// yieldで再帰する
				yield [nx, ny, depth + 1, pixels, arounds, colorType];
			}
			// 上下左右の探索が終わったようだ！
			// カラータイプを返す
			return colorType;
		}
	}

	/** searchVertexes(imagedata)
	 */
	function searchVertexes(imagedata) {
		const allVertexes = [];
		const gusherVertexes = [];
		const rootVertexes = [];
		let globalndex = 0;
		let gusherIndex = 0;
		let rootVertexIndex = 0;
		const search = createVertexSearcher(imagedata);
		// y座標中央を取得
		const halfHeight = Math.floor(imagedata.height / 2);
		// 「y座標中央から-1方向に探索」「y座標中央+1から+1方向に探索」の2回に分けよう
		for (let i = 0; i < 2; i += 1) {
			// 探索開始y座標 halfHeight + (0 or 1)
			const startY = halfHeight + i;
			// y座標移動量 -1 or 1
			const deltaY = (i === 0) ? -1 : 1;
			// 継続するかどうかをチェックする関数
			// 「上に探索」のときはy座標が0以上であることが継続条件だし
			// 「下に探索」のときはy座標が画像の高さ未満であることが継続条件
			const doContinue = (y) => ((i === 0) ? (y >= 0) : (y < imagedata.height));
			// さあ、探索しよう！
			// 上で作った条件でy座標を走査
			for (let y = startY; doContinue(y); y += deltaY) {
				// この行が「有意味なピクセルが何もない行」であるかどうか
				// とりあえずtrue 有意味なピクセルがひとつでもあればfalseにすることにしよう
				let isNullLine = true;
				// x座標を走査
				for (let x = 0; x < imagedata.width; x += 1) {
					// 変数を用意してサーチ用のジェネレータ関数を実行する
					const pixels = [];
					const arounds = [];
					const type = runRecursive(search, x, y, 0, pixels, arounds, null);
					// 無意味なピクセルではなかったならば、この行には意味があったのだ！
					if (type !== COLOR_TYPE_EMPTY) {
						isNullLine = false;
					}
					// 頂点ピクセル座標配列にひとつでも座標が入っていれば
					if (pixels.length !== 0) {
						// カラータイプによって分岐
						switch (type) {
							// カラータイプ：頂点ならば
							case COLOR_TYPE_GUSHER_VERTEX:
								const r = getRedValue(imagedata, x, y);
								console.log(`${r}番目の間欠泉を発見しました`);
								// Vtxインスタンスを作成してrootVertexesに追加
								const gusherVtx = new Vtx(
									globalndex,
									pixels,
									arounds,
									COLOR_TYPE_GUSHER_VERTEX,
								);
								gusherVtx.gusherIndex = r;
								gusherVertexes.push(gusherVtx);
								allVertexes.push(gusherVtx);
								globalndex++;
								gusherIndex++;
								break;
							// カラータイプ：頂点なら
							case COLOR_TYPE_ROOT_VERTEX:
								console.log(`ルートの頂点を発見しました`);
								// Vtxインスタンスを作成してrootVertexesに追加
								const rootVtx = new Vtx(
									globalndex,
									pixels,
									arounds,
									COLOR_TYPE_ROOT_VERTEX,
								);
								rootVertexes.push(rootVtx);
								allVertexes.push(rootVtx);
								globalndex++;
								rootVertexIndex++;
								break;
						}
					}
				} // x座標の走査終わり
				// 無意味な行ならばy座標の走査を打ち切ってしまおう！
				if (isNullLine) {
					//break;
				}
			}
		} // y座標の走査終わり
		return [allVertexes, gusherVertexes, rootVertexes];
	}

	/** createConnectSearcher(imagedata)
	 */
	function createConnectSearcher(imagedata, vertexes) {
		// すべてのピクセルに「訪れたことがあるかどうか」のフラグを用意する
		const visitedPixels = createArray(imagedata.width, imagedata.height, false);

		/** search(x, y, depth, pixels, arounds, searchingColorType)
			 * @param {Number} x - x座標 0～width-1
			 * @param {Number} y - y座標 0～height-1
			 * @param {Number} depth - 再帰回数
			 * @param {Symbol} searchingColorType - 現在探そうとしているカラータイプ
			 * @param {Array} result - 頂点の配列
			 */
		return function* search(x, y, depth, searchingColorType, result) {
			// ここに訪れたことがあるなら終わる
			if (visitedPixels[y][x]) {
				return;
			}
			// このピクセルのカラータイプを取得
			const colorType = getColorType(imagedata, x, y);
			// 探索を続ける価値があるかどうか
			let isContinue = false;
			// 頂点のピクセルならば
			if (colorType === COLOR_TYPE_ROOT_VERTEX || colorType === COLOR_TYPE_GUSHER_VERTEX) {
				let vertexB = null;
				// 深さ5以上ならば
				if (depth > 5) {
					for (let i = 0; i < vertexes.length; i++) {
						const vtx = vertexes[i];
						for (let j = 0; j < vtx.pixels.length; j++) {
							const p = vtx.pixels[j];
							if (x === p.x && y === p.y) {
								vertexB = vtx;
								break;
							} 
						}
						if (vertexB) {
							result.push(vertexB);
						}
					}
				}
			}
			// 接続のピクセルならば
			if (colorType === COLOR_TYPE_ROOT_CONNECT || colorType === COLOR_TYPE_ROOT_CONNECT_2 || colorType === COLOR_TYPE_ROOT_CONNECT_3) {
				// もともと探している接続色と同じ場合のみ探索を続ける価値がある
				if (colorType === searchingColorType) {
					isContinue = true;
					// フラグを立ててやろう
					visitedPixels[y][x] = true;
				}
			}
			// 探索を続ける価値がなければ終わる
			if (! isContinue) {
				return;
			}
			// 探索を続ける価値のあるピクセルのようだ！
			// 上下左右を探索する
			for (const [dx, dy] of DIRS_8) {
				// 次の場所
				const nx = x + dx;
				const ny = y + dy;
				// はみ出したら次の方向へ
				if (nx < 0 || ny < 0 || nx >= imagedata.width || ny >= imagedata.height) {
					continue;
				}
				// はみ出してはいないようだ！
				// yieldで再帰する
				yield [nx, ny, depth + 1, searchingColorType, result];
			}
			// 上下左右の探索が終わったようだ！
			// カラータイプを返す
			return colorType;
		}
	}

	/** checkConnect(imagedata, vertexes)
	 */
	function checkConnect(imagedata, vertexes) {
		const lineStrs = [];
		const allLines = [];
		const search = createConnectSearcher(imagedata, vertexes);
		vertexes.forEach((vertexA) => {
			vertexA.arounds.forEach((p) => {
				const colorType = getColorType(imagedata, p.x, p.y);
				if (colorType === COLOR_TYPE_ROOT_CONNECT || colorType === COLOR_TYPE_ROOT_CONNECT_2 || colorType === COLOR_TYPE_ROOT_CONNECT_3) {
					const result = [];
					runRecursive(search, p.x, p.y, 0, colorType, result);
					if (result.length > 0) {
						const vertexB = result[0];
						const lineStrAB = vertexA.id + '-' + vertexB.id;
						const lineStrBA = vertexA.id + '-' + vertexB.id;
						if (lineStrs.indexOf(lineStrBA) < 0) {
							lineStrs.push(lineStrAB);
							allLines.push([vertexA, vertexB]);
						}
						vertexA.connectTo(vertexB);
						console.log(`${vertexA.id}と${vertexB.id}は繋がってるよ`);
					}
				}
			});
		});
		return [lineStrs, allLines];
	}

	/** getDistance(v1, v2)
	 */
	const getDistance = (v1, v2) => Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);

	/** getHarfVector(v1, v2)
	 */
	const getHarfVector = (v1, v2) => ({
		x: Math.floor((v2.x + v1.x) / 2),
		y: Math.floor((v2.y + v1.y) / 2),
	});

	/** getColorType(imagedata, x, y)
	 */
	const getColorType = (imagedata, x, y) => {
		const i = 4 * (Math.floor(x) + Math.floor(y) * imagedata.width);
		const r = imagedata.data[i + 0];
		const g = imagedata.data[i + 1];
		const b = imagedata.data[i + 2];
		if (r <= 20 && g === 150 && b === 0) {
			return COLOR_TYPE_GUSHER_VERTEX;
		} else if (r === 0 && g === 0 && b === 255) {
			return COLOR_TYPE_ROOT_VERTEX;
		} else if (r === 255 && g === 0 && b === 0) {
			return COLOR_TYPE_ROOT_CONNECT;
		} else if (r === 255 && g === 150 && b === 0) {
			return COLOR_TYPE_ROOT_CONNECT_2;
		} else if (r === 255 && g === 200 && b === 0) {
			return COLOR_TYPE_ROOT_CONNECT_3;
		} else {
			return COLOR_TYPE_EMPTY;
		}
	};

	/** getRedValue(imagedata, x, y)
	 */
	const getRedValue = (imagedata, x, y) => {
		const i = 4 * (Math.floor(x) + Math.floor(y) * imagedata.width);
		const r = imagedata.data[i + 0];
		return r;
	};

	/** parseColorStr(rgb)
	 */
	const parseColorStr = (rgb) => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

	/** createArray(width, height, initialValue)
	 */
	const createArray = (width, height, initialValue) => {
		const array = [];
		for (let y = 0; y < height; y += 1) {
			array[y] = [];
			for (let x = 0; x < width; x += 1) {
				array[y][x] = initialValue;
			}
		}
		return array;
	};

	/** execCopy(str)
	 * https://qiita.com/simiraaaa/items/2e7478d72f365aa48356
	 */
	const execCopy = (str) => {
		var tmp = document.createElement('div');
		var pre = document.createElement('pre');
		pre.style.webkitUserSelect = 'auto';
		pre.style.userSelect = 'auto';
		tmp.appendChild(pre).textContent = str;
		var s = tmp.style;
		s.position = 'fixed';
		s.right = '200%';
		document.body.appendChild(tmp);
		document.getSelection().selectAllChildren(tmp);
		var result = document.execCommand('copy');
		document.body.removeChild(tmp);
		return result;
	}

	/** logPathData(pathData)
	 */
	const logPathData = (pathData) => {
		const vertexes = [];
		pathData.allVertexes.forEach((vertex) => {
			let alphabet = '*';
			let rootConnects = [];
			if (vertex.type === COLOR_TYPE_GUSHER_VERTEX) {
				alphabet = String.fromCharCode(('A').charCodeAt() + vertex.gusherIndex);
			}
			vertex.connects.forEach((v) => {
				rootConnects.push(v.id);
			});
			vertexes.push({
				x: vertex.x,
				y: vertex.y,
				alphabet: alphabet,
				rootConnectIds: rootConnects,
			})
		});
		const str = JSON.stringify(vertexes);
		console.log(str);
		window.onclick = () => {
			const ret = execCopy(str);
			if (ret) {
				alert('copied!');
			}
		};
	};

	/** runRecursive(func, ...args)
	 * https://qiita.com/uhyo/items/21e2dc2b9b139473d859
	 */
	const runRecursive = (func, ...args) => {
		const rootCaller = {
			lastReturnValue: null,
		};
		const callStack = [];
		callStack.push({
			iterator: func(...args),
			lastReturnValue: null,
			caller: rootCaller,
		});
		while (callStack.length > 0) {
			const stackFrame = callStack[callStack.length - 1];
			const { iterator, lastReturnValue, caller } = stackFrame;
			const { value, done } = iterator.next(lastReturnValue);
			if (done) {
				caller.lastReturnValue = value;
				callStack.pop();
			} else {
				callStack.push({
					iterator: func(...value),
					lastReturnValue: null,
					caller: stackFrame,
				});
			}
		}
		return rootCaller.lastReturnValue;
	};

	/** showSamplePathData(options)
	 */
	const showSamplePathData = async (options) => {
		const $canvas = document.createElement('canvas');
		$canvas.setAttribute('width', CANVAS_WIDTH);
		$canvas.setAttribute('height', CANVAS_HEIGHT);
		document.querySelector(options.canvasWrapper).append($canvas);
		stage = new createjs.Stage($canvas);

		const $$image = new createjs.Bitmap(`${options.courseImageDir}/${options.stage}-normal.png`);
		$$image.image.onload = () => {
			stage.update();
		};
		$$image.alpha = 0.5;
		stage.addChild($$image);

		/*
		await (() => {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve();
				}, 100);
			});
		})();
		*/

		pathData = await createPathDataFromImage(`${options.coursePathImageDir}/${options.stage}-normal.png`);
		logPathData(pathData);

		pathData.rootVertexes.forEach((vtx) => {
			vtx.drawVertex('red', 3);
		});
		pathData.gusherVertexes.forEach((vtx) => {
			vtx.drawVertex();
		});
		pathData.allLines.forEach((line) => {
			Vtx.prototype.drawLine(...line, 'red', 1)
		});
		stage.update();
	};

	window.showSamplePathData = showSamplePathData;
})();
