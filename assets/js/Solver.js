/**
 * https://qiita.com/gushwell/items/2dfde9e736884461b090
 * @gushwell
 */
export default class Solver {

	constructor () {
		this.points = [];
	}

	solve(pts) {
		this.points = pts;
		return this.getFramePoints();
	};
	
	getCenterPoint(pts) {
		let sumx = 0;
		let sumy = 0;
		pts.forEach((p) => {
			sumx += p.x;
			sumy += p.y;
		});
		return {
			x: sumx / pts.length,
			y: sumy / pts.length,
		}
	}

	// 枠を形成するポイントを求める
	getFramePoints() {
		// 配列内の特定の要素の最小値を求めている
		let minx = Math.min(...this.points.map(o => o.x));
		// 最も左側のポイントを得る
		let left = this.points.find(p => p.x === minx);
		// 配列内の特定の要素の最大値を求めている
		let maxx = Math.max(...this.points.map(o => o.x));
		// 最も右側のポイントを得る
		let right = this.points.find(p => p.x === maxx);
		// 下半分を求める
		let q1 = this._getFramePointsHalf(left, right, (now, seq) => {
			return Math.max(...seq.map(p => Solver._gradient(now, p)));
		});
		// 上半分を求める
		let q2 = this._getFramePointsHalf(left, right, (now, seq) => {
			return Math.min(...seq.map(p => Solver._gradient(now, p)));
		});
		return q1.concat(q2.slice().reverse()); // a.slice().reverse() で非破壊的逆順
	};

	// 2点の傾き
	static _gradient(p1, p2) {
		return (p2.y - p1.y) / (p2.x - p1.x);
	};

	// 上(下)半分を求める
	_getFramePointsHalf(now, right, maxGradient) {
		let result = [now];
		while (now.x != right.x || now.y != right.y) {
			// 現地点より右側にあるポイントを得る
			let seq = this.points.filter(p => p.x > now.x);
			// 右側にあるポイントの中で最大傾斜角をもつポイントを求める
			let next = seq.find(p => Solver._gradient(now, p) == maxGradient(now, seq));
			result.push(next);
			now = next;
			if (now === undefined)
				break;
		}
		return result;
	};
}
