'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TicTacticsTools = React.createClass({
	displayName: 'TicTacticsTools',
	getInitialState: function getInitialState() {
		return {
			me: null,
			megaboards: [{
				boards: {
					A: {
						tiles: {
							a: false,
							b: false,
							c: false,
							d: false,
							e: false,
							f: false,
							g: false,
							h: false,
							i: false
						}
					},
					B: {
						tiles: {
							a: false,
							b: false,
							c: false,
							d: false,
							e: false,
							f: false,
							g: false,
							h: false,
							i: false
						}
					},
					C: {
						tiles: {
							a: false,
							b: false,
							c: false,
							d: false,
							e: false,
							f: false,
							g: false,
							h: false,
							i: false
						}
					},
					D: {
						tiles: {
							a: false,
							b: false,
							c: false,
							d: false,
							e: false,
							f: false,
							g: false,
							h: false,
							i: false
						}
					},
					E: {
						tiles: {
							a: false,
							b: false,
							c: false,
							d: false,
							e: false,
							f: false,
							g: false,
							h: false,
							i: false
						}
					},
					F: {
						tiles: {
							a: false,
							b: false,
							c: false,
							d: false,
							e: false,
							f: false,
							g: false,
							h: false,
							i: false
						}
					},
					G: {
						tiles: {
							a: false,
							b: false,
							c: false,
							d: false,
							e: false,
							f: false,
							g: false,
							h: false,
							i: false
						}
					},
					H: {
						tiles: {
							a: false,
							b: false,
							c: false,
							d: false,
							e: false,
							f: false,
							g: false,
							h: false,
							i: false
						}
					},
					I: {
						tiles: {
							a: false,
							b: false,
							c: false,
							d: false,
							e: false,
							f: false,
							g: false,
							h: false,
							i: false
						}
					}
				},
				canChooseAnyTile: true,
				previous: 'Ee',
				turn: 'blue',
				blue: 'x',
				red: 'o'
			}]
		};
	},
	componentWillMount: function componentWillMount() {
		var _this = this;

		this.firebase = new Firebase('https://mismith.firebaseio.com/tic-tactics-tools');
		this.firebase.onAuth(function (authData) {
			if (authData) {
				(function () {
					var me = _this.firebase.child('users').child(authData.uid);
					me.update(authData[authData.provider]);

					_this.firebase.root().child('.info/connected').on('value', function (snap) {
						if (snap.val()) {
							me.child('online').onDisconnect().set(new Date().toISOString());
							me.child('online').set(true);
						}
					});
				})();
			}
			_this.setState({ me: authData });
		});
	},
	login: function login() {
		this.firebase.authWithOAuthPopup('facebook');
	},
	logout: function logout() {
		this.firebase.unauth();
	},
	handleClick: function handleClick(i, j, player, previous, e) {
		if (e.shiftKey) {
			var newPlayer = player;
			if (!player) newPlayer = 'blue';else if (player === 'blue') newPlayer = 'red';else if (player === 'red') newPlayer = false;

			this.setState(React.addons.update(this.state, {
				megaboards: {
					0: {
						boards: _defineProperty({}, i, {
							tiles: _defineProperty({}, j, { $set: newPlayer })
						})
					}
				}
			}));
		} else {
			// @TODO: check if allowed

			var _newPlayer = this.state.megaboards[0].turn,
			    nextTurn = _newPlayer === 'blue' ? 'red' : 'blue';

			var canChooseAnyTile = false;
			if (previous) {
				var J = j.toUpperCase(),
				    tilesLeftInDestinationBoard = _.filter(this.state.megaboards[0].boards[J].tiles, function (tile) {
					return !tile;
				}).length;

				if (!tilesLeftInDestinationBoard || // board is already full
				J === i && tilesLeftInDestinationBoard <= 1 // took last tile in own board
				) {
						canChooseAnyTile = true;
					}
			}

			this.setState(React.addons.update(this.state, {
				megaboards: {
					0: {
						boards: _defineProperty({}, i, {
							tiles: _defineProperty({}, j, { $set: _newPlayer })
						}),
						canChooseAnyTile: { $set: canChooseAnyTile },
						previous: { $set: i + j },
						turn: { $set: nextTurn }
					}
				}
			}));
		}
	},
	render: function render() {
		var _this2 = this;

		return React.createElement(
			'div',
			{ className: 'flex-row' },
			this.state.megaboards.map(function (megaboard) {
				return React.createElement(
					'div',
					null,
					React.createElement(
						'header',
						{ className: 'flex-row flex-justify-center' },
						React.createElement(
							'div',
							{ className: 'turn-indicator' },
							React.createElement(Tile, { player: megaboard.turn, letter: megaboard.turn === 'blue' ? megaboard.blue : megaboard.red })
						)
					),
					React.createElement(MegaBoard, _extends({}, megaboard, { onClick: _this2.handleClick }))
				);
			}),
			React.createElement(
				'aside',
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
			)
		);
	}
});

var MegaBoard = React.createClass({
	displayName: 'MegaBoard',
	getDefaultProps: function getDefaultProps() {
		return {
			boards: {
				A: {
					tiles: {
						a: false,
						b: false,
						c: false,
						d: false,
						e: false,
						f: false,
						g: false,
						h: false,
						i: false
					}
				},
				B: {
					tiles: {
						a: false,
						b: false,
						c: false,
						d: false,
						e: false,
						f: false,
						g: false,
						h: false,
						i: false
					}
				},
				C: {
					tiles: {
						a: false,
						b: false,
						c: false,
						d: false,
						e: false,
						f: false,
						g: false,
						h: false,
						i: false
					}
				},
				D: {
					tiles: {
						a: false,
						b: false,
						c: false,
						d: false,
						e: false,
						f: false,
						g: false,
						h: false,
						i: false
					}
				},
				E: {
					tiles: {
						a: false,
						b: false,
						c: false,
						d: false,
						e: false,
						f: false,
						g: false,
						h: false,
						i: false
					}
				},
				F: {
					tiles: {
						a: false,
						b: false,
						c: false,
						d: false,
						e: false,
						f: false,
						g: false,
						h: false,
						i: false
					}
				},
				G: {
					tiles: {
						a: false,
						b: false,
						c: false,
						d: false,
						e: false,
						f: false,
						g: false,
						h: false,
						i: false
					}
				},
				H: {
					tiles: {
						a: false,
						b: false,
						c: false,
						d: false,
						e: false,
						f: false,
						g: false,
						h: false,
						i: false
					}
				},
				I: {
					tiles: {
						a: false,
						b: false,
						c: false,
						d: false,
						e: false,
						f: false,
						g: false,
						h: false,
						i: false
					}
				}
			},
			canChooseAnyTile: true,
			previous: 'Ee',
			turn: 'blue',
			blue: 'x',
			red: 'o',
			onClick: function onClick() {}
		};
	},
	render: function render() {
		var _props = this.props;
		var boards = _props.boards;

		var props = _objectWithoutProperties(_props, ['boards']);

		return React.createElement(
			'div',
			{ className: 'megaboard' },
			_.map(boards, function (board, i) {
				return React.createElement(Board, _extends({ key: i, i: i, tiles: board.tiles }, props));
			})
		);
	}
});

var Board = React.createClass({
	displayName: 'Board',
	getDefaultProps: function getDefaultProps() {
		return {
			tiles: {
				a: false,
				b: false,
				c: false,
				d: false,
				e: false,
				f: false,
				g: false,
				h: false,
				i: false
			},
			canChooseAnyTile: false,
			previous: 'Ee',
			turn: 'blue',
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
		tiles.a === tiles.b && tiles.b === tiles.c && (className = tiles.c) || tiles.d === tiles.e && tiles.e === tiles.f && (className = tiles.f) || tiles.g === tiles.h && tiles.h === tiles.i && (className = tiles.i) ||

		// cols
		tiles.a === tiles.d && tiles.d === tiles.g && (className = tiles.g) || tiles.b === tiles.e && tiles.e === tiles.h && (className = tiles.h) || tiles.c === tiles.f && tiles.f === tiles.i && (className = tiles.i) ||

		// diag
		tiles.a === tiles.e && tiles.e === tiles.i && (className = tiles.i) || tiles.c === tiles.e && tiles.e === tiles.g && (className = tiles.g)) {
			// this board has been won
			// (player/winner sets className inline above)
		} else if (!_.some(tiles, function (tile) {
				return !tile;
			})) {
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
		var _this3 = this;

		var _props2 = this.props;
		var i = _props2.i;
		var tiles = _props2.tiles;
		var red = _props2.red;
		var blue = _props2.blue;
		var previous = _props2.previous;
		var canChooseAnyTile = _props2.canChooseAnyTile;
		var onClick = _props2.onClick;
		var props = _objectWithoutProperties(_props2, ['i', 'tiles', 'red', 'blue', 'previous', 'canChooseAnyTile', 'onClick']);
		var zIndex = 0;

		return React.createElement(
			'div',
			{ className: 'board ' + this.getClassName() },
			_.map(tiles, function (player, j) {
				return React.createElement(Tile, _extends({
					key: j,
					player: player,
					letter: player === 'blue' ? blue : player === 'red' ? red : false,
					isPrevious: i + j === previous,
					isBlocked: j.toUpperCase() + i.toLowerCase() === previous && // can't send back
					_.filter(tiles, function (tile) {
						return !tile;
					}).length > 1 // don't block if only one left
					,
					onClick: onClick.bind(_this3, i, j, player, previous),
					style: { zIndex: 3 - zIndex++ % 3 }
				}, props));
			})
		);
	}
});

var Tile = React.createClass({
	displayName: 'Tile',
	render: function render() {
		var _props3 = this.props;
		var player = _props3.player;
		var letter = _props3.letter;
		var isPrevious = _props3.isPrevious;
		var isBlocked = _props3.isBlocked;

		var props = _objectWithoutProperties(_props3, ['player', 'letter', 'isPrevious', 'isBlocked']);

		return React.createElement(
			'button',
			_extends({ className: 'tile ' + (player || 'none') + ' ' + (isPrevious ? 'previous' : '') + ' ' + (isBlocked ? 'blocked' : '') }, props),
			letter && React.createElement('img', { src: letter + '.svg' })
		);
	}
});

ReactDOM.render(React.createElement(TicTacticsTools, null), document.getElementById('app'));
