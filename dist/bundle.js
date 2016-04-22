'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Defaults = {
	boards: {
		A: {
			tiles: {
				a: null,
				b: null,
				c: null,
				d: null,
				e: null,
				f: null,
				g: null,
				h: null,
				i: null
			}
		},
		B: {
			tiles: {
				a: null,
				b: null,
				c: null,
				d: null,
				e: null,
				f: null,
				g: null,
				h: null,
				i: null
			}
		},
		C: {
			tiles: {
				a: null,
				b: null,
				c: null,
				d: null,
				e: null,
				f: null,
				g: null,
				h: null,
				i: null
			}
		},
		D: {
			tiles: {
				a: null,
				b: null,
				c: null,
				d: null,
				e: null,
				f: null,
				g: null,
				h: null,
				i: null
			}
		},
		E: {
			tiles: {
				a: null,
				b: null,
				c: null,
				d: null,
				e: null,
				f: null,
				g: null,
				h: null,
				i: null
			}
		},
		F: {
			tiles: {
				a: null,
				b: null,
				c: null,
				d: null,
				e: null,
				f: null,
				g: null,
				h: null,
				i: null
			}
		},
		G: {
			tiles: {
				a: null,
				b: null,
				c: null,
				d: null,
				e: null,
				f: null,
				g: null,
				h: null,
				i: null
			}
		},
		H: {
			tiles: {
				a: null,
				b: null,
				c: null,
				d: null,
				e: null,
				f: null,
				g: null,
				h: null,
				i: null
			}
		},
		I: {
			tiles: {
				a: null,
				b: null,
				c: null,
				d: null,
				e: null,
				f: null,
				g: null,
				h: null,
				i: null
			}
		}
	},
	tiles: {
		a: null,
		b: null,
		c: null,
		d: null,
		e: null,
		f: null,
		g: null,
		h: null,
		i: null
	}
};

var TicTacticsTools = React.createClass({
	displayName: 'TicTacticsTools',

	mixins: [ReactFireMixin],
	getInitialState: function getInitialState() {
		return {
			me: null,
			games: [],
			selectedGameId: location.hash.substring(1)
		};
	},
	componentWillMount: function componentWillMount() {
		var _this = this;

		this.firebase = new Firebase('https://mismith.firebaseio.com/tic-tactics-tools');
		this.firebase.onAuth(function (authData) {
			if (authData) {
				(function () {
					var meRef = _this.firebase.child('users').child(authData.uid),
					    me = Object.assign(authData[authData.provider], { uid: authData.uid });
					meRef.update(me);

					_this.firebase.root().child('.info/connected').on('value', function (snap) {
						if (snap.val()) {
							meRef.child('online').onDisconnect().set(new Date().toISOString());
							meRef.child('online').set(true);
						}
					});

					_this.bindAsArray(_this.firebase.child('users:games').child(me.uid), 'games');

					_this.setState({ me: me });
				})();
			} else {
				_this.setState({ me: authData });
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
		return React.createElement(
			'div',
			{ className: 'flex-row' },
			React.createElement(Game, { gamesRef: this.firebase.child('users:games').child(this.state.me.uid), id: this.state.selectedGameId, me: this.state.me }),
			React.createElement(
				'aside',
				null,
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
					null,
					this.state.games.map(function (game) {
						return React.createElement(
							'li',
							{ key: game['.key'], className: 'gameitem flex-row' },
							React.createElement(
								'div',
								null,
								React.createElement(MegaBoard, _extends({ className: 'mini' }, game))
							),
							React.createElement(
								'div',
								{ style: { flexGrow: 1 } },
								game.opponent
							),
							React.createElement(
								'div',
								null,
								game.updated
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
			game: {
				boards: Defaults.boards,
				canChooseAnyTile: true,
				previous: 'Ee',
				turn: 'blue',
				blue: 'x',
				red: 'o'
			}
		};
	},
	componentWillMount: function componentWillMount() {
		if (this.props.gamesRef && this.props.id) {
			this.bindAsObject(this.props.gamesRef.child(this.props.id), 'game');
		}
	},
	handleSave: function handleSave() {
		if (!this.props.gamesRef) return;

		var game = Object.assign({}, this.state.game);

		if (game['.key']) {
			delete game['.key'];
			game.updated = new Date().toISOString();

			this.props.gamesRef.child(this.props.id).update(game);
		} else {
			game.created = new Date().toISOString();

			var id = this.props.gamesRef.push(game).key();

			this.props.id = id;
			location.hash = key;
		}
	},
	handleClick: function handleClick(i, j, player, previous, e) {
		var _this2 = this;

		// @TODO: check/confirm if allowed
		if (e.altKey) {
			// force set/toggle tile
			e.preventDefault();

			if (!this.state.game) this.state.game = {};
			if (!this.state.game.boards) this.state.game.boards = {};
			if (!this.state.game.boards[i]) this.state.game.boards[i] = {};
			if (!this.state.game.boards[i].tiles) this.state.game.boards[i].tiles = {};

			var newPlayer = e.type === 'contextmenu' ? 'red' : 'blue';
			if (this.state.game.boards[i].tiles[j] === newPlayer) newPlayer = null;

			this.setState({
				game: _extends({}, this.state.game, {
					boards: _extends({}, this.state.game.boards, _defineProperty({}, i, _extends({}, this.state.game.boards[i], {
						tiles: _extends({}, this.state.game.boards[i].tiles, _defineProperty({}, j, newPlayer))
					})))
				})
			});
		} else {
			// make a turn
			var _newPlayer = this.state.game.turn,
			    nextTurn = _newPlayer === 'blue' ? 'red' : 'blue';

			var canChooseAnyTile = null;
			if (previous) {
				(function () {
					var J = j.toUpperCase(),
					    tilesLeftInDestinationBoard = _.filter(Defaults.tiles, function (nil, jj) {
						return !(_this2.state.game.boards[J] && _this2.state.game.boards[J].tiles && _this2.state.game.boards[J].tiles[jj]);
					}).length;

					if (!tilesLeftInDestinationBoard || // board is already full
					J === i && tilesLeftInDestinationBoard <= 1 // took last tile in own board
					) {
							canChooseAnyTile = true;
						}
				})();
			}

			if (!this.state.game) this.state.game = {};
			if (!this.state.game.boards) this.state.game.boards = {};
			if (!this.state.game.boards[i]) this.state.game.boards[i] = {};
			if (!this.state.game.boards[i].tiles) this.state.game.boards[i].tiles = {};
			this.setState({
				game: _extends({}, this.state.game, {
					boards: _extends({}, this.state.game.boards, _defineProperty({}, i, _extends({}, this.state.game.boards[i], {
						tiles: _extends({}, this.state.game.boards[i].tiles, _defineProperty({}, j, _newPlayer))
					}))),
					canChooseAnyTile: canChooseAnyTile,
					previous: i + j,
					turn: nextTurn
				})
			});
		}
	},
	render: function render() {
		var _this3 = this;

		var _props = this.props;
		var me = _props.me;
		var className = _props.className;

		var props = _objectWithoutProperties(_props, ['me', 'className']);

		var game = this.state.game;

		return React.createElement(
			'div',
			{ className: 'gameview ' + className },
			React.createElement(
				'header',
				{ className: 'flex-row flex-align-center' },
				React.createElement(
					'output',
					null,
					me.displayName
				),
				React.createElement(
					'div',
					{ className: 'turn-indicator' },
					React.createElement(Tile, { player: game.turn, letter: game.turn === 'blue' ? game.blue : game.red })
				),
				React.createElement('input', { value: game.opponent || '', placeholder: 'Opponent name', onChange: function onChange(e) {
						return _this3.setState({ game: _extends({}, _this3.state.game, { opponent: e.target.value }) });
					} })
			),
			React.createElement(MegaBoard, _extends({ onClick: this.handleClick }, game)),
			React.createElement(
				'footer',
				{ className: 'flex-row flex-align-center' },
				React.createElement(
					'button',
					{ onClick: this.handleSave },
					'Save'
				)
			)
		);
	}
});

var MegaBoard = React.createClass({
	displayName: 'MegaBoard',
	getDefaultProps: function getDefaultProps() {
		return {
			boards: Defaults.boards
		};
	},
	render: function render() {
		var _props2 = this.props;
		var boards = _props2.boards;
		var className = _props2.className;

		var props = _objectWithoutProperties(_props2, ['boards', 'className']);

		return React.createElement(
			'div',
			{ className: 'megaboard ' + className },
			_.map(Defaults.boards, function (nil, i) {
				return React.createElement(Board, _extends({ key: i, i: i, tiles: boards[i] ? boards[i].tiles : Defaults.tiles }, props));
			})
		);
	}
});

var Board = React.createClass({
	displayName: 'Board',
	getDefaultProps: function getDefaultProps() {
		return {
			tiles: Defaults.tiles,
			i: 'A',
			canChooseAnyTile: null,
			blue: 'x',
			red: 'o',
			onClick: function onClick() {}
		};
	},
	getClassName: function getClassName() {
		var className = '',
		    tiles = this.props.tiles;

		if (
		// rows
		tiles.a === tiles.b && tiles.b === tiles.c && (className = tiles.c || '') || tiles.d === tiles.e && tiles.e === tiles.f && (className = tiles.f || '') || tiles.g === tiles.h && tiles.h === tiles.i && (className = tiles.i || '') ||

		// cols
		tiles.a === tiles.d && tiles.d === tiles.g && (className = tiles.g || '') || tiles.b === tiles.e && tiles.e === tiles.h && (className = tiles.h || '') || tiles.c === tiles.f && tiles.f === tiles.i && (className = tiles.i || '') ||

		// diag
		tiles.a === tiles.e && tiles.e === tiles.i && (className = tiles.i || '') || tiles.c === tiles.e && tiles.e === tiles.g && (className = tiles.g || '')) {
			// this board has been won
			// (player/winner sets className inline above)
		} else if (_.filter(Defaults.tiles, function (nil, jj) {
				return !tiles[jj];
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
		var _this4 = this;

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

		return React.createElement(
			'div',
			{ className: 'board ' + this.getClassName() },
			_.map(Defaults.tiles, function (nil, j) {
				return React.createElement(Tile, _extends({
					key: j,
					player: tiles[j] || null,
					letter: tiles[j] === 'blue' ? blue : tiles[j] === 'red' ? red : false,
					isPrevious: i + j === previous,
					isBlocked: j.toUpperCase() + i.toLowerCase() === previous && // can't send back
					_.filter(Defaults.tiles, function (nil, jj) {
						return !tiles[jj];
					}).length > 1 // don't block if only one left
					,
					onClick: onClick.bind(_this4, i, j, tiles[j], previous),
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
