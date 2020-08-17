/** Vertex
 */
export default class Vertex {
	/** .constructor()
	 */
	constructor(def) {
		this.alphabet = def.alphabet;
		this.x = def.x;
		this.y = def.y;
		this.rootConnects = [];
		if (def.alphabet !== '*') {
			this.isAnswerCandidate = false;
			this.isGoalCandidate = false;
			this.goalConnects = [];
			this.suimyakuConnects = [];
			this.suimyakuNoConnects = [];
		}
	}
	
	isConnectTo(alphabet) {
		for (let i = 0; i < this.suimyakuConnects.length; i++) {
			if (alphabet === this.suimyakuConnects[i].alphabet) {
				return true;
			}
		}
		return false;
	}
}
