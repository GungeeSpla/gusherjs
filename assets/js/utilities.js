import * as constants from './constants.js';

/** create$$arrow()
 * 矢印用のShapeオブジェクトを作ります。
 * graphicsにmoveToLineToメソッドを持たせています。
 */
export function create$$arrow(src, vtx1, vtx2) {
	const $$arrow = new createjs.Bitmap(src);
	$$arrow.x = vtx2.x;
	$$arrow.y = vtx2.y;
	$$arrow.regX = 118;
	$$arrow.regY = 64;
	$$arrow.scale = 0.6;
	const vec = getRelativeVector(vtx1, vtx2);
	const vecLen = getVectorLength(vec);
	if (vecLen < 40) {
		$$arrow.regX = 92;
	}
	// 矢印ベクトルの角度
	const sin = vec.y / vecLen;
	const asin = Math.asin(sin) * (180 / Math.PI);
	$$arrow.set({ rotation: (vec.x > 0) ? asin : 180 - asin });
	return $$arrow;
}

/** getDistance(vertexA, vertexB)
 * 座標vertexAから座標vertexBまでの距離を返します。
 */
export function getDistance(vertexA, vertexB) {
	return Math.sqrt((vertexA.x - vertexB.x) ** 2 + (vertexA.y - vertexB.y) ** 2);
}

/** getRelativeVector(vertexA, vertexB)
 * vertexAからvertexBに向かう相対ベクトルを返します。
 */
export function getRelativeVector(vertexA, vertexB) {
	return {
		x: vertexB.x - vertexA.x,
		y: vertexB.y - vertexA.y,
	};
}

/** getAbsoluteVector(vectorA, vectorB)
 * vectorAにvectorBを足したベクトルを返します。
 */
export function getAbsoluteVector(vectorA, vectorB) {
	return {
		x: vectorB.x + vectorA.x,
		y: vectorB.y + vectorA.y,
	};
}

/** getVectorLength(vector)
 * vectorの長さを返します。
 */
export function getVectorLength(vector) {
	return Math.sqrt(vector.x ** 2 + vector.y ** 2);
}

/** getRotatedVector(vector, degree)
 * ベクトルをdegree度だけ回転させたベクトルを返します。
 */
export function getRotatedVector(vector, degree) {
	const rad = degree * (Math.PI / 180);
	const sin = Math.sin(rad);
	const cos = Math.cos(rad);
	return {
		x: -sin * vector.y + cos * vector.x,
		y: sin * vector.x + cos * vector.y,
	};
}

/** getExtendedVector(vector, addLen)
 */
export function getExtendedVector(vector, addLen) {
	const vecLen = getVectorLength(vector);
	const newVecLen = vecLen + addLen;
	const deg = getVectorAngle(vector);
	return getRotatedVector({ x: newVecLen, y: 0 }, deg);
}

/** getVectorAngle(vector)
 * ベクトルの角度(0～360)を返します。
 * 水平右向きが0度、反時計回りがプラスです。
 */
export function getVectorAngle(vector) {
	// アークサイン（-180～180）を取得
	const asin = Math.asin(vector.y / Math.sqrt(vector.x ** 2 + vector.y ** 2)) * (180 / Math.PI);
	let deg;
	if (vector.y > 0) {
		if (vector.x > 0) {
			deg = asin;
		} else {
			deg = 180 - asin;
		}
	} else if (vector.x > 0) {
		deg = 360 - Math.abs(asin);
	} else {
		deg = 180 + Math.abs(asin);
	}
	return deg % 360;
}

/** createArray(length, initialValue)
 * 指定の長さと初期値の配列を作ります。
 */
export function createArray(length, initialValue) {
	const arr = [];
	for (let i = 0; i < length; i += 1) {
		arr[i] = initialValue;
	}
	return arr;
}

/** getTime()
 * 現在時刻を取得します。
 * performance.nowが使えるならそちらを、使えなければDateを使います。
 */
const canUsePerformance = (window.performance !== undefined);
export function getTime() {
	if (canUsePerformance) {
		return window.performance.now();
	}
	return new Date().getTime();
}

/** alphabet2number(str)
 * たとえば 'A', 'B', 'C', ... を 0, 1, 2, ... に変換します。
 */
export function alphabet2number(str) {
	return str.toUpperCase().charCodeAt() - ('A').charCodeAt();
}

/** number2alphabet(idx)
 * たとえば 0, 1, 2, ... を 'A', 'B', 'C', ... に変換します。
 */
export function number2alphabet(idx) {
	return String.fromCharCode(('A').charCodeAt() + idx);
}

/** execCopy(str)
 * https://qiita.com/simiraaaa/items/2e7478d72f365aa48356
 */
function execCopy(str) {
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
	if (result) {
		notifyFooter('コピーしました: ' + str);
	}
	return result;
}

/** empty$element(id)
 * idから取得したDOM要素を空にします。（子要素の全削除）
 */
export function empty$element(arg) {
	const $origin = (typeof arg === 'string') ? document.getElementById(arg) : arg;
	const $clone = $origin.cloneNode(false);
	$origin.parentNode.replaceChild($clone, $origin);
}

/** logObjectCount($$container)
 * StageあるいはContainerが含むすべてのDisplayObjectの数を数えます。
 */
export function logObjectCount($$container, depth = 0) {
	let count = 0;
	$$container.children.forEach((child) => {
		if (child instanceof createjs.Container) {
			count += logObjectCount(child, depth + 1);
		} else {
			count += 1;
		}
	});
	if (depth === 0) {
		console.log(`${count} display obejcts exist.`);
	}
	return count;
}

/** downloadCanvas(id, filename, type)
 * https://blog.katsubemakito.net/html5/canvas-download
 * @param {string} id - 対象とするcanvasのid
 * @param {string} fllename - ファイル名
 * @param {string} type - MimeType
 */
export function downloadCanvas(id, filename = 'canvas', type = 'image/png') {
	const blob = getBlobFromCanvas(id, type);         // canvasをBlobデータとして取得
	const dataURI = window.URL.createObjectURL(blob); // Blobデータを「URI」に変換
	const event = document.createEvent('MouseEvents');
	event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	const a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
	a.href = dataURI;       // URI化した画像
	a.download = filename;  // デフォルトのファイル名
	a.dispatchEvent(event); // イベント発動
}

/** getBlobFromCanvas(id, type)
 * 現状のCanvasを画像データとして返却
 * @param {string} id - 対象とするcanvasのid
 * @param {string} [type] - MimeType
 * @return {blob}
 */
function getBlobFromCanvas(id, type = 'image/png') {
	const canvas = (typeof id === 'string') ? document.getElementById(id) : id;
	const base64 = canvas.toDataURL(type);           // 'data:image/png;base64,iVBORw0k～'
	const tmp = base64.split(',');                   // ['data:image/png;base64,', 'iVBORw0k～']
	const data = atob(tmp[1]);                       // 右側のデータ部分(iVBORw0k～)をデコード
	const mime = tmp[0].split(':')[1].split(';')[0]; // 画像形式(image/png)を取り出す
	// Blobのコンストラクタに食わせる値を作成
	let buff = new Uint8Array(data.length);
	for (let i = 0; i < data.length; i++) {
		buff[i] = data.charCodeAt(i);
	}
	return new Blob([buff], { type: mime });
}
