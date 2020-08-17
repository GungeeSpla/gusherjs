export const GUSHER_RADIUS = 22;
export const GUSHER_BGCOLOR = '#160';
export const GUSHER_BGCOLOR_ATARI_CANDIDATE = '#F80';
export const GUSHER_STROKE_WIDTH = 5;
export const GUSHER_STROKE_COLOR = '#000';
export const GUSHER_BORDER_COLOR = '#FFF';
export const GUSHER_STR_BIG = '大';
export const GUSHER_STR_SMALL = '小';
export const GUSHER_STR_BIG_EN = '↑';//'▌'
export const GUSHER_STR_SMALL_EN = '↓';//'▖'
export const GOLDIE_PATH_BORDER_WIDTH = 22;
export const GOLDIE_PATH_WIDTH = 10;
export const GOLDIE_PATH_COLOR = '#ff8700';
export const WATER_VEIN_COLOR = '#199';
export const WATER_VEIN_WIDTH = 5;
export const WATER_VEIN_BORDER_COLOR = '#FFF';
export const WATER_VEIN_GROUP_COLORS = [
	'#0469e1',
	'#f3b707',
	'#f3360e',
	'#04c4d9',
	'#f38607',
];
export const GUSHER_LABEL_BOLD = 'bold';
export const GUSHER_LABEL_SIZE = 30;
export const GUSHER_LABEL_FONT = 'sans-serif';
export const GUSHER_LABEL_COLOR = '#FFF';
export const GUSHER_LABEL_BORDER_COLOR = '#000';
export const STORAGE_KEY = 'gusherjs';
export const ELEMENT_IDS = {
	'gusherjs-wrapper': 'gusherjs-wrapper',
	'canvas-wrapper': 'gusherjs-canvas-wrapper',
	'element-wrapper': 'gusherjs-element-wrapper',
};

// キャンバスの横幅
export const CANVAS_WIDTH = 640;
// キャンバスの高さ
export const CANVAS_HEIGHT = 960;
// キャンバスの中央X座標
export const CANVAS_CENTER_X = CANVAS_WIDTH / 2;
// キャンバスの中央Y座標
export const CANVAS_CENTER_Y = CANVAS_HEIGHT / 2;
// キャンバスの背景色
export const BACKGROUND_COLOR = '#F2F2F2';
// キャンバスのレイヤー
export const CANVAS_LAYERS = [
	'background',
	'main',
];
export const GUSHER_LAYERS = [
	'base',
	'gushers-border',
	'water-vein',
	'water-vein-group',
	'goldie-path',
	'procedure',
	'gushers',
];
// StageGLを利用するか
export const IS_STAGEGL = false;

export const BORDER_WIDTH = 8;
export const BORDER_COLOR = '#ffffff';
export const STROKE_LINECAP = 'round';

/** コースデータ
 */
export const COURSE_DATA = {

	/** シェケナダム
	 */
	shekenadamu: {

		/** 通常
		 */
		normal: {
			name: {
				ja: 'シェケナダム通常間欠泉',
				en: 'Spawning-Grounds-Normal-Tide-Gushers',
			},
			vertexDefs: [{"x":1071,"y":1002,"alphabet":"B","rootConnectIds":[14,18,1]},{"x":1132,"y":1001,"alphabet":"*","rootConnectIds":[0,10,2]},{"x":1192,"y":1001,"alphabet":"*","rootConnectIds":[1,4]},{"x":1343,"y":1001,"alphabet":"D","rootConnectIds":[16]},{"x":1192,"y":925,"alphabet":"*","rootConnectIds":[2,5]},{"x":1419,"y":925,"alphabet":"C","rootConnectIds":[4,7,21]},{"x":1011,"y":838,"alphabet":"*","rootConnectIds":[11,23,13]},{"x":1419,"y":803,"alphabet":"*","rootConnectIds":[5,8]},{"x":1589,"y":803,"alphabet":"*","rootConnectIds":[7,9,17]},{"x":1680,"y":803,"alphabet":"E","rootConnectIds":[8]},{"x":1132,"y":783,"alphabet":"*","rootConnectIds":[1,11]},{"x":994,"y":718,"alphabet":"I","rootConnectIds":[6,10]},{"x":972,"y":1093,"alphabet":"A","rootConnectIds":[13,14]},{"x":1011,"y":1093,"alphabet":"*","rootConnectIds":[6,12,14,23]},{"x":1071,"y":1093,"alphabet":"*","rootConnectIds":[0,12,13,15,18]},{"x":1192,"y":1093,"alphabet":"*","rootConnectIds":[14,16,19]},{"x":1343,"y":1093,"alphabet":"*","rootConnectIds":[3,15,17]},{"x":1375,"y":1093,"alphabet":"*","rootConnectIds":[8,16]},{"x":1071,"y":1152,"alphabet":"*","rootConnectIds":[0,14,19,20]},{"x":1192,"y":1152,"alphabet":"*","rootConnectIds":[15,18,20,24]},{"x":1282,"y":1152,"alphabet":"*","rootConnectIds":[18,19,21,25]},{"x":1419,"y":1152,"alphabet":"*","rootConnectIds":[5,20,22]},{"x":1664,"y":1151,"alphabet":"F","rootConnectIds":[21]},{"x":1011,"y":1211,"alphabet":"*","rootConnectIds":[6,13,24]},{"x":1192,"y":1211,"alphabet":"*","rootConnectIds":[19,23,29]},{"x":1282,"y":1214,"alphabet":"*","rootConnectIds":[20,26]},{"x":1359,"y":1214,"alphabet":"*","rootConnectIds":[25,28]},{"x":1273,"y":1274,"alphabet":"G","rootConnectIds":[28]},{"x":1359,"y":1274,"alphabet":"*","rootConnectIds":[26,27]},{"x":1192,"y":1395,"alphabet":"H","rootConnectIds":[24]}],
			suimyakuConnectStrs: ['AB', 'AD', 'AG', 'AH', 'BC', 'BD', 'BG', 'BI', 'CD', 'CE', 'CF', 'CG', 'DE', 'DF', 'DG', 'EF', 'GH'],
			goalConnectStrs: ['A-EFI', 'B-EFH', 'C-AHI', 'D-HI', 'E-ABGH', 'F-ABGH', 'G-EFI', 'H-BCDF', 'I-ACDH'],
			josekiDefs: [
				{
					name: {
						ja: 'スタンダード (E-H)',
						en: 'Standard (E-H)',
					},
					text: `
						E
						__(E大) FDC
						__(E小) H
						____(H大) GA
						____(H小) IB
					`,
					more: {
						ja: `「各方面の先端の栓を順繰りに開けていき、高ければその方面に当たりがある」というスタンダードな定石です。多くのプレイヤーに共有されています。<br><br>Fの代わりにEを開けることもできます。FとEは情報量的に等価値です。開栓の速さを重視するならF、ザコシャケの遠さを重視するならEを開けるとよいでしょう。`,
						en: `Standard tactic: Open the furthest gusher in each direction in order. If a gusher is high, the Goldie is in that direction. <br><br>You can open either E or F, as they provide the same information in regards to Goldie location. If you are aiming for speed, start with F. If you are aiming for more space from lessers, start with E.`,
					}
				},
				{
					name: {
						ja: 'スタンダード (E-G)',
						en: 'Standard (E-G)',
					},
					text: `
						E
						__(E大) FDC
						__(E小) G
						____(G大) H
						______(H大) A
						______(H小) B
						____(G小) I
					`,
					more: {
						ja: `スタンダードな開け方を少し変えたものです。Hの代わりにGを開けます。I、Bを素早く特定することができます。<br><br>Fの代わりにEを開けることもできます。FとEは情報量的に等価値です。開栓の速さを重視するならF、ザコシャケの遠さを重視するならEを開けるとよいでしょう。`,
						en: `A slightly modified version of the standard tactic: Open G instead of H, which enables the Goldie to be found quicker if it's in either I or B. <br><br>You can then open either E or F, as they provide the same information. If you are aiming for speed, start with F. If you are aiming for more space from lessers, start with E.`,
					}
				},
				{
					name: {
						ja: 'スピード (DG)',
						en: 'Fast (DG)',
					},
					text: `
						DG
						__(D大G大) A
						____(A大) B
						____(A小) C
						__(D大G小) FE
						__(D小G大) H
						__(D小G小) I
					`,
					more: {
						ja: `いきなりDGのふたつを開けてしまい、その大小の組み合わせで当たりの間欠泉を絞り込もうとする、過激な定石です。<br><br>実際には、Dが小ならば、Gを開けることなくHを開けるほうが少ない手数で済みます。しかし、わかりやすさや開栓の早さから2点開けが好まれる場合があります。`,
						en: `A radical, but fast tactic: Open D and G first. Then, narrow down where the Goldie is located with the information from these gushers. `,
					}
				},
			],
			width: 2000,
			height: 2000,
			scale: 0.73,
			rotation: 0,
			x: 82,
			y: 404,
			centerX: 1324,
			centerY: 1112,
			marginPositionX: 'right',
			marginPositionY: 'bottom',
		},

		/** 満潮
		 */
		high: {
			name: {
				ja: 'シェケナダム満潮間欠泉',
				en: 'Spawning-Grounds-High-Tide-Gushers',
			},
			excludeGusherStr: 'DEHI',
			goalConnectStrs: ['F-ABG', 'G-F', 'A-CF', 'B-F', 'C-A'], 
			josekiDefs: [
				{
					name: {
						ja: 'スタンダード (F)',
						en: 'Standard (F)',
					},
					text: `
						F
						__(F大) C
						__(F小) GAB
					`,
					more: {
						ja: `Fを開けて、高ければC、低ければGABの順に開けます。ザコシャケが邪魔になりにくい、スタンダードな定石です。`,
						en: `Standard tactic: Open F first. If it's high, open C. If it's low, open GAB, in that order. This way, lessers are less of a threat.`,
					}
				},
				{
					name: {
						ja: 'スピード (A)',
						en: 'Fast (A)',
					},
					text: `
						A
						__(A大) BG
						__(A小) CF
					`,
					more: {
						ja: `GとFが外れのケースを考慮せず、ABC当たりに可能性を絞った危険な定石です。`,
						en: `A dangerous, but fast tactic: Open A first. This tactic works best if the Goldie is <b>not</b> located in either F or G.`,
					}
				},
				{
					name: {
						ja: 'スピード (C)',
						en: 'Fast (C)',
					},
					text: `
						C
						__(C大) G
						____(G大) B
						____(G小) F
						__(C小) A
					`,
					more: {
						ja: `いきなりCを開ける過激な定石です。AかCが当たりであれば、すぐにキンシャケを出すことができます。`,
						en: `A radical, but fast tactic: Open C first. This will enable the Goldie to be located quickly <b>if</b> it's in either A or C, which provides two good possible Goldie paths. `,
					}
				},
			],
		},
	},

	/** 難破船ドン･ブラコ
	 */
	domburako: {

		/** 通常
		 */
		normal: {
			name: {
				ja: 'ドンブラコ通常間欠泉',
				en: 'Marooners-Bay-Normal-Tide-Gushers',
			},
			vertexDefs: [{"x":1184,"y":860,"alphabet":"C","rootConnectIds":[6]},{"x":779,"y":858,"alphabet":"B","rootConnectIds":[9,2]},{"x":896,"y":849,"alphabet":"*","rootConnectIds":[1,3]},{"x":1170,"y":849,"alphabet":"*","rootConnectIds":[2,6]},{"x":938,"y":792,"alphabet":"*","rootConnectIds":[5,10,24]},{"x":1014,"y":792,"alphabet":"D","rootConnectIds":[4]},{"x":1170,"y":787,"alphabet":"*","rootConnectIds":[0,3,13]},{"x":1014,"y":723,"alphabet":"*","rootConnectIds":[8,11]},{"x":1091,"y":723,"alphabet":"*","rootConnectIds":[7,12,25]},{"x":779,"y":628,"alphabet":"*","rootConnectIds":[1,14]},{"x":938,"y":609,"alphabet":"*","rootConnectIds":[4,24,11,19]},{"x":1014,"y":609,"alphabet":"*","rootConnectIds":[7,10,15]},{"x":1091,"y":609,"alphabet":"*","rootConnectIds":[8,13,20]},{"x":1170,"y":609,"alphabet":"*","rootConnectIds":[6,12]},{"x":852,"y":553,"alphabet":"*","rootConnectIds":[9,17]},{"x":1014,"y":506,"alphabet":"F","rootConnectIds":[11]},{"x":779,"y":505,"alphabet":"E","rootConnectIds":[17]},{"x":852,"y":505,"alphabet":"*","rootConnectIds":[14,16,18]},{"x":852,"y":425,"alphabet":"*","rootConnectIds":[17,19]},{"x":938,"y":425,"alphabet":"*","rootConnectIds":[10,18,20,22]},{"x":1091,"y":425,"alphabet":"*","rootConnectIds":[12,19,21]},{"x":1200,"y":425,"alphabet":"H","rootConnectIds":[20]},{"x":938,"y":360,"alphabet":"*","rootConnectIds":[19,23]},{"x":963,"y":318,"alphabet":"G","rootConnectIds":[22]},{"x":938,"y":1015,"alphabet":"*","rootConnectIds":[4,10,26]},{"x":1091,"y":1016,"alphabet":"*","rootConnectIds":[8,26]},{"x":1016,"y":1044,"alphabet":"A","rootConnectIds":[24,25]}],
			suimyakuConnectStrs: ['AB', 'AC', 'AD', 'BC', 'BD', 'BE', 'CD', 'CF', 'DE', 'DF', 'DH', 'EF', 'EG', 'EH', 'FG', 'FH', 'GH'],
			goalConnectStrs: ['A-EFGH', 'B-AD', 'C-AD', 'D-EFGH', 'E-AD', 'F-AD', 'G-AD', 'H-AD'],
			josekiDefs: [
				{
					name: {
						ja: 'スタンダード (BC)',
						en: 'Standard (BC)',
					},
					text: `
						BC
						__(B大C大) DA
						__(B大C小) E
						__(B小C大) F
						__(B小C小) GH
					`,
					more: {
						ja: `左右の金網下のふたつの栓を開けて、その大小の組み合わせによって当たりを絞り込む定石です。手数的にも開栓作業的にも当たりを素早く出すことができ、ザコシャケも邪魔にならずに済むため、合理的な開け方であるとして多くのプレイヤーに共有されています。`,
						en: `Standard tactic: Open B or C first. Then, narrow down where the Goldie is located using the information from both gushers.`,
					}
				},
			],
			width: 2000,
			height: 2000,
			scale: 0.653,
			rotation: 0,
			x: 381,
			y: 647,
			centerX: 903,
			centerY: 752,
			marginPositionX: 'left',
			marginPositionY: 'bottom',
		},

		/** 満潮
		 */
		high: {
			name: {
				ja: 'ドンブラコ満潮間欠泉',
				en: 'Marooners-Bay-High-Tide-Gushers',
			},
			excludeGusherStr: 'BCEG',
			goalConnectStrs: ['A-FH', 'D-H', 'F-AD', 'H-AD', ], 
			josekiDefs: [
				{
					name: {
						ja: 'スタンダード (H)',
						en: 'Standard (H)',
					},
					text: `
						H
						__(H大) FD
						__(H小) A
					`,
					more: {
						ja: `奥を開けて高ければ奥ふたつのどちらか、低ければカゴ前。FとHは情報量的に等価値なので、Hの代わりにFを開けることもできます。`,
						en: `Standard tactic: Open H first. If H is low, the Goldie is in A. If H is high, the Goldie is in F or D. If low on time, it's possible to start with F instead of H, because both F and H provide the same information.`,
					}
				},
			],
		},
	},

	/** 海上集落シャケト場
	 */
	shaketoba: {

		/** 通常
		 */
		normal: {
			name: {
				ja: 'シャケト場通常間欠泉',
				en: 'Lost-Outpost-Normal-Tide-Gushers',
			},
			vertexDefs: [{"x":460,"y":950,"alphabet":"A","rootConnectIds":[1]},{"x":566,"y":950,"alphabet":"*","rootConnectIds":[0,2]},{"x":566,"y":918,"alphabet":"*","rootConnectIds":[1,3]},{"x":748,"y":918,"alphabet":"*","rootConnectIds":[2,4,14]},{"x":778,"y":918,"alphabet":"B","rootConnectIds":[3,5]},{"x":894,"y":918,"alphabet":"*","rootConnectIds":[4,8]},{"x":1220,"y":905,"alphabet":"I","rootConnectIds":[11]},{"x":1403,"y":904,"alphabet":"G","rootConnectIds":[11]},{"x":894,"y":857,"alphabet":"*","rootConnectIds":[5,9]},{"x":1054,"y":857,"alphabet":"*","rootConnectIds":[8,10,12]},{"x":1124,"y":857,"alphabet":"*","rootConnectIds":[9,11]},{"x":1220,"y":857,"alphabet":"*","rootConnectIds":[6,7,10,20,28]},{"x":1054,"y":811,"alphabet":"*","rootConnectIds":[9,15]},{"x":689,"y":797,"alphabet":"C","rootConnectIds":[14]},{"x":748,"y":797,"alphabet":"*","rootConnectIds":[3,13,18]},{"x":1054,"y":784,"alphabet":"*","rootConnectIds":[12,16]},{"x":1054,"y":763,"alphabet":"*","rootConnectIds":[15,17]},{"x":1054,"y":737,"alphabet":"*","rootConnectIds":[16,25]},{"x":748,"y":736,"alphabet":"*","rootConnectIds":[14,19]},{"x":811,"y":736,"alphabet":"*","rootConnectIds":[18,22]},{"x":1220,"y":708,"alphabet":"*","rootConnectIds":[11,21,28]},{"x":1311,"y":708,"alphabet":"H","rootConnectIds":[20]},{"x":811,"y":648,"alphabet":"*","rootConnectIds":[19,23,26]},{"x":916,"y":648,"alphabet":"*","rootConnectIds":[22,24,32]},{"x":976,"y":648,"alphabet":"E","rootConnectIds":[23,25]},{"x":1054,"y":648,"alphabet":"*","rootConnectIds":[17,24,26]},{"x":1069,"y":648,"alphabet":"*","rootConnectIds":[22,25,27,29,28]},{"x":1144,"y":648,"alphabet":"*","rootConnectIds":[26,28,31]},{"x":1220,"y":648,"alphabet":"*","rootConnectIds":[11,20,26,27]},{"x":1069,"y":464,"alphabet":"F","rootConnectIds":[26]},{"x":977,"y":395,"alphabet":"*","rootConnectIds":[32,31,33]},{"x":1144,"y":395,"alphabet":"*","rootConnectIds":[27,30]},{"x":916,"y":394,"alphabet":"*","rootConnectIds":[23,30]},{"x":977,"y":325,"alphabet":"D","rootConnectIds":[30]}],
			suimyakuConnectStrs: ['AB', 'AC', 'BC', 'BE', 'CE', 'DE', 'DF', 'EF', 'EH', 'EI', 'FH', 'GH', 'GI', 'HI'],
			goalConnectStrs: ['A-DEFI', 'B-DFGI', 'C-DFGH', 'D-BCHI', 'E-AG', 'F-BCGI', 'G-BDEF', 'H-ABCD', 'I-BCDF'],
			josekiDefs: [
				{
					name: {
						ja: 'スタンダード (A-D-G)',
						en: 'Standard (A-D-G)',
					},
					text: `
						A
						__(A大) CB
						__(A小) D
						____(D大) FE
						____(D小) GHI
					`,
					more: {
						ja: `「各方面の先端の栓を順繰りに開けていき、高ければその方面に当たりがある」というスタンダードな定石です。多くのプレイヤーに共有されています。`,
						en: `Standard tactic: Open the furthest gusher in each direction. If a gusher is high, the Goldie is in that direction. This tactic should be executed by two or more players, as it is too time consuming if executed by one player.`,
					}
				},
				{
					name: {
						ja: 'フリーランス (D-H)',
						en: 'Freelance (D-H)',
					},
					text: `
						D
						__(D大) FE
						__(D小) H
						____(H大) GI
						____(H小) ACB
					`,
					more: {
						ja: `「最悪なパターンを一番最初に潰しておくべき」という理念の元、金網の栓を最初に開ける定石です。金網発のキンシャケは絶対に部屋の中を通らないことに注意してください。`,
						en: `Freelancer tactic: Open D first. This is the worst gusher, but this allows you to find the Goldie quickly if it's located on the grates. However, speed is important, as none of the Goldies found on the grates go through the house.`,
					}
				},
				{
					name: {
						ja: 'フリーランス (F-H)',
						en: 'Freelance (F-H)',
					},
					text: `
						F
						__(F大) D
						____(D大) E
						____(D小) H
						__(F小) H
						____(H大) GI
						____(H小) ACB
					`,
					more: {
						ja: `基本理念はフリーランス (D-H)と同じですが、Dの代わりにより近いFを利用します。D-H型よりも素早く開栓作業を行うことができます。`,
						en: `Another freelancer tactic: Open F first. This tactic is very similar to "Freelance (D-H)", except F is used if D is too far away.`,
					}
				},
				{
					name: {
						ja: '最小手数',
						en: 'Minimum',
					},
					text: `
						H
						__(H大) E
						____(E大) FI
						____(E小) G
						__(H小) A
						____(A大) CB
						____(A小) D
					`,
					more: {
						ja: `情報量の多いHから開けることで最小手数で当たりを特定できる手順です。ひとりで開ける場合、H小A小Dは時間がかかりすぎるため、H小のあとにDをボムで開けることが推奨されます。`,
						en: `Fast tactic: If H is low, open D with a bomb as you move to A. This enables the Goldie to be located quickly, as the sequence of opening H↓ → A↓ → D is very time consuming when executed by a single player. This tactic enables the Goldie to be located with the fewest number of steps.`,
					}
				},
			],
			width: 2000,
			height: 2000,
			scale: 0.569,
			rotation: 0,
			x: 347,
			y: 613,
			centerX: 951,
			centerY: 773,
			marginPositionX: 'left',
			marginPositionY: 'top',
		},

		/** 満潮
		 */
		high: {
			name: {
				ja: 'シャケト場満潮間欠泉',
				en: 'Lost-Outpost-High-Tide-Gushers',
			},
			excludeGusherStr: 'ADFG',
			goalConnectStrs: ['B-HI', 'C-HI', 'E-H', 'H-BC', 'I-BC'], 
			josekiDefs: [
				{
					name: {
						ja: 'スタンダード (C)',
						en: 'Standard (C)',
					},
					text: `
						C
						__(C大) EB
						__(C小) HI
					`,
					more: {
						ja: `水脈は左右対称なので、Cから開けてもHから開けても手数は同じです。しかしE当たりのキンシャケは確定でHに入るため、E当たりのときにザコシャケが邪魔にならないようにCから開けることが好まれる場合があります。<br><br>「初手C大→B」派のプレイヤーと「初手H大→I」派のプレイヤーがかち合うとE当たりのときに全開けになってしまうため、野良では「初手C大→E」が推奨されます。`,
						en: `Standard tactic: The gushers on this map are symmetrical, so opening C or H provides the same information. However, opening C is preferable, because, in the event that the Goldie is located in E, it will always move to H. <br><br>When freelancing, if C is high, quickly open E. The reason for this is that, if the Goldie is in E, freelancers might open all other gushers first because they will all be high.`,
					}
				},
			],
		},
	},

	/** トキシラズいぶし工房
	 */
	tokishirazu: {

		/** 通常
		 */
		normal: {
			name: {
				ja: 'トキシラズ通常間欠泉',
				en: 'Salmonid-Smokeyard-Normal-Tide-Gushers',
			},
			vertexDefs: [{"x":581,"y":977,"alphabet":"B","rootConnectIds":[1]},{"x":656,"y":977,"alphabet":"*","rootConnectIds":[0,2,18]},{"x":821,"y":977,"alphabet":"*","rootConnectIds":[1,3,20]},{"x":1013,"y":977,"alphabet":"E","rootConnectIds":[2,5]},{"x":514,"y":911,"alphabet":"*","rootConnectIds":[5,6]},{"x":1013,"y":911,"alphabet":"*","rootConnectIds":[3,4,8]},{"x":436,"y":833,"alphabet":"D","rootConnectIds":[4,16,7]},{"x":487,"y":783,"alphabet":"*","rootConnectIds":[6,8]},{"x":1013,"y":783,"alphabet":"*","rootConnectIds":[5,7,13]},{"x":848,"y":720,"alphabet":"*","rootConnectIds":[10,12]},{"x":924,"y":720,"alphabet":"G","rootConnectIds":[9]},{"x":660,"y":657,"alphabet":"*","rootConnectIds":[12,14]},{"x":848,"y":657,"alphabet":"*","rootConnectIds":[9,11,13]},{"x":1013,"y":657,"alphabet":"*","rootConnectIds":[8,12]},{"x":660,"y":592,"alphabet":"F","rootConnectIds":[11]},{"x":886,"y":1041,"alphabet":"C","rootConnectIds":[21]},{"x":505,"y":1047,"alphabet":"*","rootConnectIds":[6,17]},{"x":597,"y":1047,"alphabet":"*","rootConnectIds":[16,18,19]},{"x":656,"y":1047,"alphabet":"*","rootConnectIds":[1,17]},{"x":597,"y":1138,"alphabet":"A","rootConnectIds":[17]},{"x":821,"y":1138,"alphabet":"*","rootConnectIds":[2,21]},{"x":886,"y":1138,"alphabet":"*","rootConnectIds":[15,20]}],
			suimyakuConnectStrs: ['AB', 'AC', 'AD', 'BC', 'BD', 'BF', 'CE', 'CG', 'DF', 'EG', 'FG'],
			goalConnectStrs: ['A-EFG', 'B-EG', 'C-DF', 'D-CEG', 'E-ABDF', 'F-ABCE', 'G-ABD'],
			josekiDefs: [
				{
					name: {
						ja: 'スタンダード (FG)',
						en: 'Standard (FG)',
					},
					text: `
						FG
						__(F大G小) DB
						__(F小G大) EC
						__(F小G小) A
					`,
					more: {
						ja: ``,
						en: `Standard tactic: Open the two gushers on the opposite end of the map first.`,
					},
				},
				{
					name: {
						ja: '最小手数',
						en: 'Minimum',
					},
					text: `
						F
						__(F大) D
						____(D大) B
						____(D小) G
						__(F小) E
						____(E大) C
						____(E小) A
					`,
					more: {
						ja: ``,
						en: `A tactic that will find the Goldie in the fewest number of steps.`,
					},
				},
			],
			width: 2000,
			height: 2000,
			scale: 0.777,
			rotation: 0,
			x: 539,
			y: 497,
			centerX: 720,
			centerY: 925,
			marginPositionX: 'right',
			marginPositionY: 'bottom',
		},

		/** 満潮
		 */
		high: {
			name: {
				ja: 'トキシラズ満潮間欠泉',
				en: 'Salmonid-Smokeyard-High-Tide-Gushers',
			},
			excludeGusherStr: 'DE',
			goalConnectStrs: ['A-FG', 'B-G', 'C-F', 'F-AC', 'G-AB'],
			josekiDefs: [
				{
					name: {
						ja: 'スタンダード (FG)',
						en: 'Standard (FG)',
					},
					text: `
						FG
						__(F大G小) B
						__(F小G大) C
						__(F小G小) A
					`,
					more: {
						ja: ``,
						en: `Standard tactic: Open the two gushers on the opposite end of the map first.`,
					},
				},
			],
		},
	},

	/** 朽ちた箱舟 ポラリス
	 */
	porarisu: {

		/** 通常
		 */
		normal: {
			name: {
				ja: 'ポラリス通常間欠泉',
				en: 'Ruins-of-Ark-Polaris-Normal-Tide-Gushers',
			},
			vertexDefs: [{"x":939,"y":917,"alphabet":"B","rootConnectIds":[2]},{"x":927,"y":895,"alphabet":"*","rootConnectIds":[2,4]},{"x":960,"y":895,"alphabet":"*","rootConnectIds":[0,1,3]},{"x":1299,"y":895,"alphabet":"*","rootConnectIds":[2,13]},{"x":927,"y":855,"alphabet":"*","rootConnectIds":[1,9]},{"x":1008,"y":822,"alphabet":"*","rootConnectIds":[6,10]},{"x":1140,"y":822,"alphabet":"A","rootConnectIds":[5,7]},{"x":1207,"y":822,"alphabet":"*","rootConnectIds":[6,11]},{"x":840,"y":821,"alphabet":"C","rootConnectIds":[14]},{"x":927,"y":753,"alphabet":"*","rootConnectIds":[4,10,16]},{"x":1008,"y":753,"alphabet":"*","rootConnectIds":[5,9]},{"x":1207,"y":721,"alphabet":"*","rootConnectIds":[7,12,21]},{"x":1223,"y":686,"alphabet":"E","rootConnectIds":[11]},{"x":1299,"y":649,"alphabet":"*","rootConnectIds":[3,17,25]},{"x":840,"y":634,"alphabet":"D","rootConnectIds":[8,15]},{"x":891,"y":616,"alphabet":"*","rootConnectIds":[14,16]},{"x":927,"y":616,"alphabet":"*","rootConnectIds":[9,15]},{"x":1316,"y":603,"alphabet":"G","rootConnectIds":[13]},{"x":765,"y":541,"alphabet":"*","rootConnectIds":[19,22]},{"x":1028,"y":541,"alphabet":"*","rootConnectIds":[18,20]},{"x":1095,"y":531,"alphabet":"*","rootConnectIds":[19,21]},{"x":1207,"y":531,"alphabet":"*","rootConnectIds":[11,20]},{"x":765,"y":459,"alphabet":"*","rootConnectIds":[18,23]},{"x":859,"y":459,"alphabet":"*","rootConnectIds":[22,26]},{"x":1023,"y":448,"alphabet":"*","rootConnectIds":[25,26]},{"x":1299,"y":448,"alphabet":"*","rootConnectIds":[13,24]},{"x":946,"y":431,"alphabet":"F","rootConnectIds":[23,24]}],
			suimyakuConnectStrs: ['AB', 'AC', 'AD', 'AE', 'AG', 'BC', 'BD', 'BE', 'CD', 'CE', 'CF', 'DE', 'DF', 'EF', 'EG', 'FG'],
			goalConnectStrs: ['A-F', 'B-FG', 'C-G', 'D-G', 'E-C', 'F-AB', 'G-BCD'],
			josekiDefs: [
				{
					name: {
						ja: 'スタンダード (FG)',
						en: 'Standard (FG)',
					},
					text: `
						FG
						__(F大G大) E
						__(F大G小) CD
						__(F小G大) A
						__(F小G小) B
					`,
					more: {
						ja: ``,
						en: `Standard tactic: Open the two gushers on the lowest floor first. When freelancing, opening both F and G can be challenging, so the tactic "Standard (F)" is recommended.`,
					},
				},
				{
					name: {
						ja: 'スタンダード (F)',
						en: 'Standard (F)',
					},
					text: `
						F
						__(F大) C
						____(C大) DE
						____(C小) G
						__(F小) BA
					`,
					more: {
						ja: ``,
						en: `Freelancer tactic: G should be on the back burner here.`,
					},
				},
			],
			width: 2000,
			height: 2000,
			scale: 0.659,
			rotation: 0,
			x: 297,
			y: 648,
			centerX: 1033,
			centerY: 754,
			marginPositionX: 'right',
			marginPositionY: 'bottom',
		},

		/** 満潮
		 */
		high: {
			name: {
				ja: 'ポラリス満潮間欠泉',
				en: 'Ruins-of-Ark-Polaris-High-Tide-Gushers',
			},
			excludeGusherStr: 'CFG',
			suimyakuConnectStrs: ['AB', 'AE'],
			goalConnectStrs: ['A-D', 'B-E', 'D-E', 'E-D'], 
			josekiDefs: [
				{
					name: {
						ja: 'スタンダード (B)',
						en: 'Standard (B)',
					},
					text: `
						B
						__(B大) A
						__(B小) DE
					`,
					more: {
						ja: ``,
						en: `Standard tactic: Open B first to avoid too much interference from lessers. Both E and B provide the same information, but the Goldie will never enter B, so it's preferable to open it first.`,
					},
				},
			],
		},
	},
};