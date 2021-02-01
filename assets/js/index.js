//import '../css/style.css';
import * as constants from './constants.js';
import * as utilities from './utilities.js';
import Course from './Course.js';

/** gusherjs
 */
window.gusherjs = (() => {
	
	/** instances
	 */
	let lang;
	// CreateJSのステージ
	let stage;
	// CreateJS用のキャンバス要素
	let $canvas;
	// キャンバスのラッパー
	let $gusherjs;
	let $canvasWraper;
	let $stageSelect;
	// 初期化時のオプション
	let initOptions;
	// 現在選択中のコース
	let currentCourse;
	// CreateJSのコンテナ
	let $$layers;
	// さらに深くのコンテナ
	let $$gusherLayers;
	// gusherjsが稼働中かどうか
	let isPlaying;
	// セーブ対象
	let $forSave;
	// オプション
	let $options;
	// html2canvasが動作中かどうか
	let html2canvasWorking = false;
	// measureText用のキャンバス
	let $measureTextCanvas;
	// コースデータのキャッシュ
	const courseCaches = [];
	let $gusherImages;

	/** functions
	 */

	/** downloadCanvas()
	 * Canvasおよびその上に乗っているDOMを撮影しpng画像としてダウンロードします。
	 */
	const downloadCanvas = () => {
		// html2canvasが動作中なら何もしない
		if (html2canvasWorking) {
			return;
		}
		// html2canvasは動作中だ！
		html2canvasWorking = true;
		
	    // メイリオのような行間が広いフォントが使用されている要素を
		// html2canvasにによってキャプチャしようとすると
		// なんとy座標のズレが生じてしまう！
		// その補正を行う
		const $p = document.createElement('p');
		$p.style.setProperty('margin', '0');
		$p.style.setProperty('padding', '0');
		$p.style.setProperty('line-height', 'auto');
		$p.style.setProperty('position', 'fixed');
		$p.style.setProperty('left', '-100%');
		$p.style.setProperty('top', '-100%');
		$p.style.setProperty('font-size', '100px');
		$p.textContent = 'A';
		$canvasWraper.appendChild($p);
		const height = $p.clientHeight;
		// フォントを100pxで描画しているのにクライアントハイトが100を超えるかどうかで場合分け
		if (height > 100) {
			// 越えるなら行間が広いフォントが使われているので
			// 差分に事前に確かめておいた適当な係数をかけてオフセットとする
			window.html2canvasTextOffsetY = Math.floor((height - 100) * 0.15);
		} else {
			// 越えないなら行間が広いフォントは使われていない
			// オフセットはゼロでいい
			window.html2canvasTextOffsetY = 0;
		}
		$canvasWraper.removeChild($p);
		
		// 日時の取得
		const date = new Date();
		const Y = date.getFullYear();
		const M = date.getMonth() + 1;
		const D = date.getDate();
		const h = date.getHours();
		const m = date.getMinutes();
		const s = date.getSeconds();
		const dateStr = Y + '-'
		  + ('00' + M).slice(-2) + '-'
		  + ('00' + D).slice(-2) + '-'
		  + ('00' + h).slice(-2) + '-'
		  + ('00' + m).slice(-2) + '-'
		  + ('00' + s).slice(-2);
		
		// html2canvasで撮影する
		let $base, transform;
		$base = document.querySelector('#tyrano_base');
		if ($base) {
			transform = $base.style.getPropertyValue('transform');
			$base.style.setProperty('transform', 'none');
		}
		html2canvas(document.querySelector("#gusherjs-wrapper"), {
			backgroundColor: null,
			x: 0,
			y: 0,
			scrollX: 0,
			scrollY: 0,
			logging: false,
		}).then((canvas) => {
			const courseName = currentCourse.def.name[initOptions.lang];
			utilities.downloadCanvas(canvas, courseName + '-' + dateStr);
			//document.body.appendChild(canvas)
			html2canvasWorking = false;
			if ($base) $base.style.setProperty('transform', transform);
		}).catch((error) => {
			html2canvasWorking = false;
			if ($base) $base.style.setProperty('transform', transform);
		});;
	};

	/** showOptions()
	 * オプションを表示します。
	 */
	const showOptions = () => {
		$gusherjs.querySelector('#gusherjs-options-wrapper').style.setProperty('display', 'block');
		currentCourse.finishSpecifing();
	};

	/** hideOptions()
	 * オプションを隠します。
	 */
	const hideOptions = () => {
		$gusherjs.querySelector('#gusherjs-options-wrapper').style.setProperty('display', 'none');
	}

	/** clearCanvas()
	 * キャンバスをクリアします。
	 */
	const clearCanvas = () => {
		Object.keys($$gusherLayers).forEach((key) => {
			$$gusherLayers[key].removeAllChildren();
		});
		utilities.empty$element('gusherjs-joseki-text');
		$gusherjs.querySelector('#gusherjs-joseki-text').style.setProperty('display', 'none');
		$gusherjs.querySelector('#gusherjs-joseki-next').style.setProperty('display', 'none');
	};
	
	const reset = () => {
		currentCourse.reset();
	};

	/** selectCourse(course, tide)
	 * コースを選択します。
	 */
	const selectCourse = async (course, tide) => {
		// キャッシュに格納するキーを作成
		const key = `${course}-${tide}`;
		// キャッシュにインスタンスが存在しないならば新しく作る！
		if (true || courseCaches[key] === undefined) {
			// コースの定義データを作成する
			let def;
			// 満潮かどうか
			if (tide !== 'high') {
				// 満潮でないならば単にconstantsから持ってくるだけでいいのだが
				def = constants.COURSE_DATA[course][tide];
			} else {
				// 満潮ならば
				// とりあえず満潮のデータをconstantsから持ってくる
				// ただし、これはすかすかのデータである
				const highDef = constants.COURSE_DATA[course][tide];
				// 通常水位のコピーデータも持ってくる
				const normalDef = JSON.parse(JSON.stringify(constants.COURSE_DATA[course].normal));
				// 満潮のデータが持っているプロパティを通常水位のコピーデータに上書きする
				Object.keys(highDef).forEach((defKey) => {
					normalDef[defKey] = highDef[defKey];
				});
				// 一連の処理を行った通常水位のコピーデータを定義として使用する
				def = normalDef;
			}
			// 使用するコース画像ファイルの場所
			def.image = `${initOptions.courseImageDir}/${course}-${tide}.png`;
			// コースインスタンスを作成してキャッシュに放り込む
			courseCaches[key] = new Course(def, Object.assign({
				stage,
				$gusherjs,
				$gusherImages,
				$measureTextCanvas,
				$$parentLayer: $$layers['main'],
				$$gusherLayers,
			}, initOptions));
		}
		// キャッシュからインスタンスを持ってきて代入する
		currentCourse = courseCaches[key];
		//
		Array.prototype.forEach.call($stageSelect.querySelectorAll('option'), ($option, i) => {
			if (key === $option.value) {
				$stageSelect.selectedIndex = i;
			}
		});
		// 定石を選択するための<select>を整備する
		const $josekiSelect = $gusherjs.querySelector('#joseki-select');
		let selectHtml = `<option value="-1">-</option>`;
		currentCourse.def.josekiDefs.forEach((josekiDef, i) => {
			selectHtml += `<option value="${i}">${josekiDef.name[initOptions.lang]}</option>`;
		});
		$josekiSelect.innerHTML = selectHtml;
		$josekiSelect.addEventListener('change', () => {
			const idx = $josekiSelect.selectedIndex;
			const value = $josekiSelect.options[idx].value;
			//currentCourse.applyJoseki(parseInt(value));
			currentCourse.selectedJosekiId = parseInt(value);
			currentCourse.reset();
		});
		// コースを描画する
		clearCanvas();
		currentCourse.updateVisible();
		currentCourse.draw();
		/*
		window.onkeydown = (e) => {
			switch (e.key) {
				case 'ArrowUp':
					currentCourse.y--;
					break;
				case 'ArrowDown':
					currentCourse.y++;
					break;
				case 'ArrowLeft':
					currentCourse.x--;
					break;
				case 'ArrowRight':
					currentCourse.x++;
					break;
				case 'a':
					currentCourse.scale -= 0.01;
					break;
				case 's':
					currentCourse.scale += 0.01;
					break;
			}
			console.log('x: ', currentCourse.x);
			console.log('y: ', currentCourse.y);
			console.log('scale: ', currentCourse.scale);
			console.log('update');
			currentCourse.draw();
		};
		*/
	};

	/** initializeVariables()
	 * 変数に初期値を代入します。
	 */
	const initializeVariables = () => {
		// stage = null;
		// $canvas = null;
		// $$layers = {};
		initOptions = null;
		currentCourse = null;
		isPlaying = false;
	};

	/** initialize(options)
	 + gusherjsの初期化を行います。
	 */
	const initialize = (options) => {
		// 初期化済みならば何もしない
		if (initOptions) {
			return;
		}
		// 変数を初期化
		initializeVariables();
		// 初期化時のオプションを保存しておく
		initOptions = options;
		// 間欠泉用の画像素材を読み込んでおく
		$gusherImages = {};
		['big', 'small', 'answer'].forEach((name) => {
			const img = new Image();
			img.onload = () => {
				stage.update();
			};
			img.src = initOptions.gusherImageDir + '/gusher_' + name + '.png';
			$gusherImages[name] = img;
		});
		// テキストの横幅を図るためだけの<canvas>を作って格納しておく
		$measureTextCanvas = document.createElement('canvas');
		// GusherJS全体のラッパー
		$gusherjs = document.querySelector('#gusherjs-wrapper');
		// セーブ対象の要素
		$forSave = $gusherjs.querySelectorAll('.for-save');
		// オプション内容
		$options = $gusherjs.querySelectorAll('input');
		options.width = options.width || constants.CANVAS_WIDTH;
		options.height = options.height || constants.CANVAS_HEIGHT;
		loadStorage();
		// キャンバスをまだ作成したことがないなら作成する
		if (!$canvas) {
			// <canvas>要素を作成
			$canvas = document.createElement('canvas');
			$canvas.setAttribute('width', options.width);
			$canvas.setAttribute('height', options.height);
			$canvas.id = 'gusherjs'
			// CreateJSのステージを作成
			stage = new createjs.Stage($canvas);
			// タッチイベントが発火するかどうか
			if (createjs.Touch.isSupported()) {
				// タッチイベントが発火するなら
				// CreateJSのタッチ操作を有効にする
				createjs.Touch.enable(stage);
			} else {
				// タッチイベントが発火しないなら
				// マウスオーバーを有効化する
				stage.enableMouseOver();
			}
			// レイヤーを作成して追加する
			$$layers = {};
			constants.CANVAS_LAYERS.forEach((key) => {
				$$layers[key] = new createjs.Container();
				stage.addChild($$layers[key]);
			});
			// 
			const $$backgroundColor = new createjs.Shape();
			$$backgroundColor.graphics
			.beginFill(constants.BACKGROUND_COLOR)
			.rect(0, 0, options.width, options.height);
			$$layers['background'].addChild($$backgroundColor);
			$$gusherLayers = {};
			constants.GUSHER_LAYERS.forEach((key) => {
				$$gusherLayers[key] = new createjs.Container();
				$$layers['main'].addChild($$gusherLayers[key]);
			});
		}
		// $canvasをDOMに追加する
		$canvasWraper = $gusherjs.querySelector('#gusherjs-canvas-wrapper');
		$canvasWraper.append($canvas);
		$gusherjs.style.setProperty('width', options.width + 'px');
		$gusherjs.style.setProperty('height', options.height + 'px');
		Array.prototype.forEach.call($options, ($input) => {
			$input.addEventListener('change', () => {
				currentCourse.updateVisible();
			});
		});
		const updateButtonVisibles = () => {
			const $targets = $gusherjs.querySelectorAll('.for-seeking');
			const style = ($gusherjs.querySelector('#gusherjs-mode-seeking-goldie').checked)
				? 'block' : 'none';
			Array.prototype.forEach.call($targets, ($target) => {
				$target.style.setProperty('display', style);
			});
		};
		Array.prototype.forEach.call($gusherjs.querySelectorAll('input[name=gusherjs-mode]'), ($input) => {
			$input.addEventListener('change', () => {
				updateButtonVisibles();
				currentCourse.selectedJosekiId = -1;
				currentCourse.reset();
			});
		});
		updateButtonVisibles();
		Array.prototype.forEach.call($forSave, ($input) => {
			$input.addEventListener('change', () => {
				saveStorage();
			});
		});
		if (initOptions.lang === 'en') {
			Array.prototype.forEach.call($gusherjs.querySelectorAll('.for-translation'), ($forTranslation) => {
				$forTranslation.textContent = $forTranslation.getAttribute('en-text');
			});
		}
		$stageSelect = $gusherjs.querySelector('#gusherjs-course-select');
		$stageSelect.addEventListener('change', () => {
			const idx = $stageSelect.selectedIndex;
			const value = $stageSelect.options[idx].value;
			const course = value.split('-')[0];
			const tide = value.split('-')[1];
			selectCourse(course, tide);
			hideOptions();
		});
		console.log('GusherJS initialized.');
	};

	/** finalize()
	 * gusherjsの終了処理を行います。
	 */
	const finalize = () => {
		// 初期化がされていないならば何もしない
		if (!initOptions) {
			return;
		}
		// 稼働中なら止める
		if (isPlaying) {
			stop();
		}
		// 初期化時のオプションを取得
		const options = initOptions;
		// 追加したDOM要素を削除
		utilities.empty$element('gusherjs-canvas-wrapper');
		utilities.empty$element('gusherjs-element-wrapper');
		// 変数を初期化
		initializeVariables();
		console.log('GusherJS finalized.');
	};

	/** start(options)
	 * gusherjsを開始します。非同期。
	 */
	const start = async (options = initOptions) => {
		// 初期化が済んでいなければ初期化する
		if (!initOptions) {
			initialize(options);
		}
		// コースを選択する
		await selectCourse(options.course, options.tide);
		// フラグを立てる
		isPlaying = true;
		console.log('GusherJS started.');
	};

	/** stop()
	 * gusherjsをいったん停止します。
	 */
	const stop = () => {
		clearCanvas();
		stage.update();
		// フラグを折る
		isPlaying = false;
		console.log('GusherJS stopped.');
	};


	/** saveStorage()
	 * localStorageにセーブします。
	 */
	function saveStorage() {
		const saveDataObj = {};
		Array.prototype.forEach.call($forSave, ($input) => {
			const key = $input.getAttribute('id');
			if (key) {
				saveDataObj[key] = $input.checked;
			}
		});
		const saveDataJSON = JSON.stringify(saveDataObj);
		localStorage.setItem(constants.STORAGE_KEY, saveDataJSON);
	}


	/** loadStorage()
	 * localStorageからロードします。
	 */
	function loadStorage() {
		var saveDataJSON = localStorage.getItem(constants.STORAGE_KEY);
		if (saveDataJSON !== null) {
			var saveDataObj = JSON.parse(saveDataJSON);
			// いったんすべてのチェックを外し
			Array.prototype.forEach.call($forSave, ($input) => {
				$input.checked = false;
			});
			// チェックを入れる必要があるものは入れ直す
			Array.prototype.forEach.call($forSave, ($input) => {
				const key = $input.getAttribute('id');
				if (saveDataObj[key]) {
					$input.checked = true;
				}
			});
		}
	}

	/** getCurrentCourse()
	 */
	function getCurrentCourse() {
		return currentCourse;
	}

	/** - return -
	 */
	return {
		stop,
		start,
		initialize,
		finalize,
		showOptions,
		hideOptions,
		downloadCanvas,
		getCurrentCourse,
	};
})();
