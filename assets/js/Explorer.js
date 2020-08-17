/** Explorer
 */
export default class Explorer {
	/** .constructor()
	 */
	constructor() {
	}
	
	
	static getDistance (v1, v2) {
		return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
	}
	
	
	static getScore (vtxA, vtxB, depth) {
		const distance = Explorer.getDistance(vtxA, vtxB);
		const score = - distance - depth * 5;
		return score;
	}
	
	
	static explore (vtxA, vtxFrom, scoreFrom, depth) {
		vtxA.rootConnects.forEach((vtxB) => {
			// もともと来たところに帰ることはない
			if (vtxB === vtxFrom) {
				return;
			}
			// 距離をもとにスコアを計算
			const score = Explorer.getScore(vtxA, vtxB, depth) + scoreFrom;
			// スコアを更新できたら
			if (score > vtxB.score) {
				vtxB.score = score;
				vtxB.fromVertex = vtxA;
				// 再帰
				Explorer.explore(vtxB, vtxA, score, depth + 1);
			}
		});
	}
	
	
	go(startVertex) {
		Explorer.explore(startVertex, null, 0, 0);
	}
}
