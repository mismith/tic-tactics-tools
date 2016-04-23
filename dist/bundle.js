'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function mapInOrder(obj, callback, context) {
	var _this = this;

	return Object.keys(obj).sort(function (a, b) {
		return a < b ? -1 : 1;
	}).map(function (k) {
		return callback.call(context || _this, obj[k], k);
	});
}

var Defaults = {};
Defaults.tiles = function () {
	var overrides = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	return _.defaultsDeep(overrides, {
		a: null,
		b: null,
		c: null,
		d: null,
		e: null,
		f: null,
		g: null,
		h: null,
		i: null
	});
};
Defaults.boards = function () {
	var overrides = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	return _.defaultsDeep(overrides, {
		A: {
			tiles: Defaults.tiles()
		},
		B: {
			tiles: Defaults.tiles()
		},
		C: {
			tiles: Defaults.tiles()
		},
		D: {
			tiles: Defaults.tiles()
		},
		E: {
			tiles: Defaults.tiles()
		},
		F: {
			tiles: Defaults.tiles()
		},
		G: {
			tiles: Defaults.tiles()
		},
		H: {
			tiles: Defaults.tiles()
		},
		I: {
			tiles: Defaults.tiles()
		}
	});
};
Defaults.game = function () {
	var overrides = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	return _.defaultsDeep(overrides, {
		boards: Defaults.boards(),
		canChooseAnyTile: true,
		previous: 'Ee',
		turn: 'blue',
		blue: 'x',
		red: 'o'
	});
};

var TicTacticsTools = React.createClass({
	displayName: 'TicTacticsTools',

	mixins: [ReactFireMixin],
	getInitialState: function getInitialState() {
		return {
			me: null,
			games: [],
			gameRef: null
		};
	},
	componentWillMount: function componentWillMount() {
		var _this2 = this;

		this.firebase = new Firebase('https://mismith.firebaseio.com/tic-tactics-tools');
		this.firebase.onAuth(function (authData) {
			if (authData) {
				(function () {
					// user profile
					var meRef = _this2.firebase.child('users').child(authData.uid),
					    me = Object.assign(authData[authData.provider], { uid: authData.uid });
					meRef.update(me);

					// online presence
					_this2.firebase.root().child('.info/connected').on('value', function (snap) {
						if (snap.val()) {
							meRef.child('online').onDisconnect().set(new Date().toISOString());
							meRef.child('online').set(true);
						}
					});

					// games
					var gamesRef = _this2.firebase.child('users:games').child(me.uid),
					    gameRef = gamesRef.child(gamesRef.push().key());
					_this2.bindAsArray(gamesRef, 'games');

					_this2.setState({ me: me, gameRef: gameRef });
				})();
			} else {
				_this2.setState({ me: authData });
			}
		});
	},
	login: function login() {
		this.firebase.authWithOAuthPopup('facebook');
	},
	logout: function logout() {
		this.firebase.unauth();
	},
	render: function render() {
		var _this3 = this;

		return React.createElement(
			'div',
			{ className: 'flex-row', style: { width: '100%' } },
			React.createElement(Game, { id: 'game', gameRef: this.state.gameRef, me: this.state.me }),
			React.createElement(
				'aside',
				{ id: 'sidebar' },
				React.createElement(
					'header',
					null,
					React.createElement(
						'button',
						{ hidden: this.state.me, onClick: this.login },
						'Login with Facebook'
					),
					React.createElement(
						'button',
						{ hidden: !this.state.me, onClick: this.logout },
						'Logout'
					)
				),
				React.createElement(
					'ul',
					{ className: 'gameitems' },
					React.createElement(
						'li',
						{ className: 'gameitem new', onClick: function onClick(e) {
								return _this3.setState({ gameRef: _this3.firebaseRefs.games.child(_this3.firebaseRefs.games.push().key()) });
							} },
						React.createElement(
							'figure',
							null,
							React.createElement('img', { src: 'plus.svg', height: '50' })
						),
						React.createElement(
							'div',
							null,
							'New'
						)
					),
					this.state.games.sort(function (a, b) {
						return (a.updated || a.created) > (b.updated || b.created) ? -1 : 1;
					}).map(function (game) {
						return React.createElement(
							'li',
							{ key: game['.key'], className: 'gameitem ' + (game['.key'] === _this3.state.gameRef.key() ? 'active' : ''), onClick: function onClick(e) {
									return _this3.setState({ gameRef: _this3.firebaseRefs.games.child(game['.key']) });
								} },
							React.createElement(
								'figure',
								null,
								React.createElement(MegaBoard, _extends({ className: 'mini' }, game))
							),
							React.createElement(
								'div',
								null,
								React.createElement(
									'div',
									null,
									game.opponent || 'Opponent'
								),
								React.createElement(
									'time',
									{ datetime: game.updated || game.created, title: game.updated || game.created },
									moment(game.updated || game.created).fromNow()
								)
							)
						);
					})
				)
			)
		);
	}
});

var Game = React.createClass({
	displayName: 'Game',

	mixins: [ReactFireMixin],
	getInitialState: function getInitialState() {
		return {
			game: Defaults.game()
		};
	},
	componentWillMount: function componentWillMount() {
		if (this.props.gameRef) {
			this.bindAsObject(this.props.gameRef, 'game');
		}
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		if (this.props.gameRef !== nextProps.gameRef) {
			if (this.firebaseRefs.game) this.unbind('game');
			this.bindAsObject(nextProps.gameRef, 'game');
		}
	},
	handleSave: function handleSave() {
		if (!this.props.gameRef) return;

		var game = Object.assign({}, this.state.game);
		game[game.created ? 'updated' : 'created'] = new Date().toISOString();
		delete game['.key'];
		delete game['.value'];

		this.props.gameRef.update(game);
	},
	handleClick: function handleClick(i, j, player, previous, e) {
		// @TODO: check/confirm if allowed
		var game = Defaults.game(this.state.game);

		if (e.altKey) {
			// force set/toggle tile
			e.preventDefault();

			var newPlayer = e.type === 'contextmenu' ? 'red' : 'blue';
			if (game.boards[i].tiles[j] === newPlayer) newPlayer = null;

			game.boards[i].tiles[j] = newPlayer;
		} else {
			// make a turn
			game.canChooseAnyTile = false;
			if (previous) {
				var J = j.toUpperCase(),
				    tilesLeftInDestinationBoard = _.filter(game.boards[J].tiles, function (tile) {
					return !tile;
				}).length;

				if (!tilesLeftInDestinationBoard || // board is already full
				J === i && tilesLeftInDestinationBoard <= 1 // took last tile in own board
				) {
						game.canChooseAnyTile = true;
					}
			}
			game.boards[i].tiles[j] = game.turn;
			game.previous = i + j;
			game.turn = game.turn === 'blue' ? 'red' : 'blue';
		}
		this.setState({ game: game });
	},
	render: function render() {
		var _this4 = this;

		var _props = this.props;
		var me = _props.me;
		var className = _props.className;
		var props = _objectWithoutProperties(_props, ['me', 'className']);
		var game = Defaults.game(this.state.game);

		return React.createElement(
			'div',
			{ className: 'gameview ' + className },
			React.createElement(
				'header',
				{ className: 'flex-row flex-align-center' },
				React.createElement(
					'output',
					null,
					me ? me.displayName : 'You'
				),
				React.createElement(
					'div',
					{ className: 'turn-indicator' },
					React.createElement(Tile, { player: game.turn, letter: game.turn === 'blue' ? game.blue : game.red })
				),
				React.createElement('input', { value: game.opponent || '', placeholder: 'Opponent name', onChange: function onChange(e) {
						return _this4.setState({ game: _extends({}, game, { opponent: e.target.value }) });
					} }),
				React.createElement(
					'button',
					{ className: 'btn green-faded', disabled: !game.opponent, onClick: this.handleSave },
					React.createElement('img', { src: 'check.svg', height: '36' })
				)
			),
			React.createElement(MegaBoard, _extends({ onClick: this.handleClick }, game))
		);
	}
});

var MegaBoard = React.createClass({
	displayName: 'MegaBoard',
	getDefaultProps: function getDefaultProps() {
		return {
			boards: Defaults.boards()
		};
	},
	render: function render() {
		var _props2 = this.props;
		var boards = _props2.boards;
		var className = _props2.className;

		var props = _objectWithoutProperties(_props2, ['boards', 'className']);

		boards = Defaults.boards(boards);

		return React.createElement(
			'div',
			{ className: 'megaboard ' + className },
			mapInOrder(boards, function (board, i) {
				return React.createElement(Board, _extends({ key: i, i: i, tiles: board.tiles }, props));
			})
		);
	}
});

var Board = React.createClass({
	displayName: 'Board',
	getDefaultProps: function getDefaultProps() {
		return {
			tiles: Defaults.tiles(),
			i: 'A',
			canChooseAnyTile: false,
			blue: 'x',
			red: 'o',
			onClick: function onClick() {}
		};
	},
	getClassName: function getClassName() {
		var className = '',
		    tiles = Defaults.tiles(this.props.tiles);

		if (
		// rows
		tiles.a === tiles.b && tiles.b === tiles.c && (className = tiles.c || '') || tiles.d === tiles.e && tiles.e === tiles.f && (className = tiles.f || '') || tiles.g === tiles.h && tiles.h === tiles.i && (className = tiles.i || '') ||

		// cols
		tiles.a === tiles.d && tiles.d === tiles.g && (className = tiles.g || '') || tiles.b === tiles.e && tiles.e === tiles.h && (className = tiles.h || '') || tiles.c === tiles.f && tiles.f === tiles.i && (className = tiles.i || '') ||

		// diag
		tiles.a === tiles.e && tiles.e === tiles.i && (className = tiles.i || '') || tiles.c === tiles.e && tiles.e === tiles.g && (className = tiles.g || '')) {
			// this board has been won
			// (player/winner sets className inline above)
		} else if (_.filter(tiles, function (tile) {
				return !tile;
			}).length === 0) {
				// no active tiles left
				// it's a tie --> make this a wildcard
				className += ' purple';
			}

		if (this.props.canChooseAnyTile || this.props.previous && this.props.previous[1].toUpperCase() === this.props.i) {
			className += ' active';
		}

		return className;
	},
	render: function render() {
		var _props3 = this.props;
		var i = _props3.i;
		var tiles = _props3.tiles;
		var canChooseAnyTile = _props3.canChooseAnyTile;
		var previous = _props3.previous;
		var blue = _props3.blue;
		var red = _props3.red;
		var onClick = _props3.onClick;
		var props = _objectWithoutProperties(_props3, ['i', 'tiles', 'canChooseAnyTile', 'previous', 'blue', 'red', 'onClick']);
		var zIndex = 0;
		tiles = Defaults.tiles(tiles);

		return React.createElement(
			'div',
			{ className: 'board ' + this.getClassName() },
			mapInOrder(tiles, function (tile, j) {
				return React.createElement(Tile, _extends({
					key: j,
					player: tile || null,
					letter: tile === 'blue' ? blue : tile === 'red' ? red : false,
					isPrevious: i + j === previous,
					isBlocked: j.toUpperCase() + i.toLowerCase() === previous && // can't send back
					_.filter(tiles, function (tile2) {
						return !tile2;
					}).length > 1 // don't block if only one left
					,
					onClick: onClick.bind(null, i, j, tile, previous),
					style: { zIndex: 3 - zIndex++ % 3 }
				}, props));
			})
		);
	}
});

var Tile = React.createClass({
	displayName: 'Tile',
	getDefaultProps: function getDefaultProps() {
		return {
			player: 'blue',
			letter: 'x'
		};
	},
	render: function render() {
		var _props4 = this.props;
		var player = _props4.player;
		var letter = _props4.letter;
		var isPrevious = _props4.isPrevious;
		var isBlocked = _props4.isBlocked;

		var props = _objectWithoutProperties(_props4, ['player', 'letter', 'isPrevious', 'isBlocked']);

		return React.createElement(
			'button',
			_extends({ className: 'tile ' + (player || 'none') + ' ' + (isPrevious ? 'previous' : '') + ' ' + (isBlocked ? 'blocked' : ''), onContextMenu: this.props.onClick }, props),
			letter && React.createElement('img', { src: letter + '.svg' })
		);
	}
});

ReactDOM.render(React.createElement(TicTacticsTools, null), document.getElementById('app'));
