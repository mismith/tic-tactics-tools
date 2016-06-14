'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

var Swipeable = React.createClass({
	displayName: 'Swipeable',
	getInitialState: function getInitialState() {
		return {
			start: 0,
			x: null,
			y: null,
			swiping: false
		};
	},
	getDefaultProps: function getDefaultProps() {
		return {
			threshold: 10
		};
	},
	handleStart: function handleStart(e) {
		var touch = e.touches && e.touches.length,
		    x = (touch ? e.touches[0] : e).clientX,
		    y = (touch ? e.touches[0] : e).clientY;

		this.setState({
			start: Date.now(),
			x: x,
			y: y
		});

		document.addEventListener(touch ? 'touchmove' : 'mousemove', this.handleMove);
		document.addEventListener(touch ? 'touchend' : 'mouseup', this.handleEnd);
	},
	handleMove: function handleMove(e) {
		var touch = e.touches && e.touches.length,
		    x = (touch ? e.touches[0] : e).clientX,
		    y = (touch ? e.touches[0] : e).clientY;

		if (Math.max(Math.abs(y - this.state.y), Math.abs(x - this.state.x)) > this.props.threshold) {
			this.setState({
				swiping: true
			});
		}
	},
	handleEnd: function handleEnd(e) {
		var touch = e.changedTouches && e.changedTouches.length,
		    x = (touch ? e.changedTouches[0] : e).clientX,
		    y = (touch ? e.changedTouches[0] : e).clientY;

		if (this.state.swiping) {
			if (x - this.state.x < -this.props.threshold) {
				this.props.onSwipeLeft && this.props.onSwipeLeft(e);
			} else if (x - this.state.x > this.props.threshold) {
				this.props.onSwipeRight && this.props.onSwipeRight(e);
			} else if (y - this.state.y < -this.props.threshold) {
				this.props.onSwipeUp && this.props.onSwipeUp(e);
			} else if (y - this.state.y > this.props.threshold) {
				this.props.onSwipeDown && this.props.onSwipeDown(e);
			}
		}

		this.setState(this.getInitialState());

		document.removeEventListener(touch ? 'touchmove' : 'mousemove', this.handleMove);
		document.removeEventListener(touch ? 'touchend' : 'mouseup', this.handleEnd);
	},
	render: function render() {
		return React.createElement(
			'div',
			_extends({}, this.props, { onMouseDown: this.handleStart, onTouchStart: this.handleStart }),
			this.props.children
		);
	}
});

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
		turns: [],
		canChooseAnyTile: null,
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
			loading: true,
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
					var meRef = _this2.firebase.child('users').child(authData.uid);
					meRef.update(_extends({}, authData[authData.provider], {
						uid: authData.uid
					}));

					_this2.bindAsObject(meRef, 'me');

					// online presence
					_this2.firebase.root().child('.info/connected').on('value', function (snap) {
						if (snap.val()) {
							meRef.child('online').onDisconnect().set(new Date().toISOString());
							meRef.child('online').set(true);
						}
					});

					// games
					var gamesRef = _this2.firebase.child('users:games').child(authData.uid);
					_this2.bindAsArray(gamesRef, 'games');
					gamesRef.once('value').then(function (snap) {
						_this2.setState({
							loading: false
						});
					});

					// load most recent game (or a new one, if none found)
					meRef.once('value').then(function (snap) {
						_this2.setState({
							gameRef: gamesRef.child(snap.val().gameId || gamesRef.push().key())
						});
					});
				})();
			} else {
				// @TODO: clean up all firebase stuff
				_this2.setState(_this2.getInitialState());
				_this2.setState({ loading: false });
			}
		});
	},
	login: function login() {
		var _this3 = this;

		this.setState({ loading: true });
		this.firebase.authWithOAuthPopup('facebook', function (err) {
			if (err && err.code === 'TRANSPORT_UNAVAILABLE') {
				_this3.firebase.authWithOAuthRedirect('facebook', function (err) {
					if (err) alert(err);
				});
			}
		});
	},
	logout: function logout() {
		this.firebase.unauth();
		location.reload(); // @HACK
	},
	createGame: function createGame(gameData) {
		var _this4 = this;

		this.pickGame(null, function () {
			return _this4.state.gameRef.update(gameData);
		});
	},
	pickGame: function pickGame(gameId, callback) {
		if (!this.firebaseRefs.games) return alert('You must login first.');
		if (!gameId) gameId = this.firebaseRefs.games.push().key();

		if (this.firebaseRefs.me) {
			this.firebaseRefs.me.update({
				gameId: gameId
			});
		}
		this.setState({
			loading: false,
			gameRef: this.firebaseRefs.games.child(gameId)
		}, callback);
	},
	deleteGame: function deleteGame(gameId) {
		if (!gameId) return;

		this.firebaseRefs.games.child(gameId).remove();

		this.pickGame(); // go to new game
	},
	render: function render() {
		var _this5 = this;

		return React.createElement(
			'div',
			{ id: 'container', className: this.state.loading ? 'loading' : '' },
			React.createElement(
				'div',
				{ id: 'game' },
				React.createElement(Game, { gameRef: this.state.gameRef, me: this.state.me })
			),
			React.createElement(
				'aside',
				{ id: 'sidebar' },
				React.createElement(
					'ul',
					{ className: 'gameitems' },
					!this.state.me && React.createElement(
						'li',
						{ className: 'gameitem new facebook', onClick: this.login },
						React.createElement(
							'div',
							{ className: 'flex-row flex-grow' },
							React.createElement(
								'figure',
								null,
								React.createElement('img', { src: 'icons/facebook.svg' })
							),
							React.createElement(
								'div',
								{ className: 'flex-grow flex-row' },
								React.createElement(
									'div',
									{ className: 'swipeable' },
									'Login with Facebook'
								)
							)
						)
					),
					this.state.me && React.createElement(
						'li',
						{ className: 'gameitem new' },
						React.createElement(
							'div',
							{ className: 'flex-row flex-grow' },
							React.createElement(
								'figure',
								null,
								React.createElement('img', { src: 'icons/plus.svg' })
							),
							React.createElement(
								'div',
								{ className: 'flex-grow flex-row' },
								React.createElement(
									'div',
									{ className: 'swipeable' },
									'Import Screenshot'
								)
							),
							React.createElement(ImageScanner, { onImageChange: function onImageChange(e) {
									return _this5.setState({ loading: true });
								}, onImageScanned: function onImageScanned(gameData) {
									return _this5.createGame(gameData);
								} })
						)
					),
					this.state.me && React.createElement(
						'li',
						{ className: 'gameitem new', onClick: this.pickGame.bind(this, null, null) },
						React.createElement(
							'div',
							{ className: 'flex-row flex-grow' },
							React.createElement(
								'figure',
								null,
								React.createElement('img', { src: 'icons/plus.svg' })
							),
							React.createElement(
								'div',
								{ className: 'flex-grow flex-row' },
								React.createElement(
									'div',
									{ className: 'swipeable' },
									'New Game'
								)
							)
						)
					),
					this.state.games.sort(function (a, b) {
						return (a.updated || a.created) > (b.updated || b.created) ? -1 : 1;
					}).map(function (game) {
						return React.createElement(GameItem, { key: game['.key'], game: game, isActive: _this5.state.gameRef && _this5.state.gameRef.key() === game['.key'], onClick: function onClick(e) {
								return _this5.pickGame(game['.key']);
							}, onDelete: function onDelete(e) {
								return _this5.deleteGame(game['.key']);
							} });
					}),
					this.state.me && React.createElement(
						'li',
						{ className: 'gameitem new red', onClick: this.logout },
						React.createElement(
							'div',
							{ className: 'flex-row flex-grow' },
							React.createElement(
								'figure',
								null,
								React.createElement('img', { src: 'icons/logout.svg' })
							),
							React.createElement(
								'div',
								{ className: 'flex-grow flex-row' },
								React.createElement(
									'div',
									{ className: 'swipeable' },
									'Logout'
								)
							)
						)
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'loader' },
				React.createElement('img', { src: 'loading.svg' })
			)
		);
	}
});

var GameItem = React.createClass({
	displayName: 'GameItem',
	getDefaultProps: function getDefaultProps() {
		return {
			game: {}
		};
	},
	getInitialState: function getInitialState() {
		return {
			deleting: false
		};
	},
	render: function render() {
		var _this6 = this;

		var _props = this.props;
		var game = _props.game;
		var isActive = _props.isActive;
		var className = _props.className;

		var props = _objectWithoutProperties(_props, ['game', 'isActive', 'className']);

		return React.createElement(
			'li',
			_extends({}, props, { className: 'gameitem ' + (isActive ? 'active' : '') + ' ' + (this.state.deleting ? 'deleting' : '') + ' ' + className }),
			React.createElement(
				'figure',
				null,
				React.createElement(MegaBoard, _extends({}, game, { className: 'mini' }))
			),
			React.createElement(
				'div',
				{ className: 'flex-grow flex-row' },
				React.createElement(
					Swipeable,
					{ className: 'swipeable', threshold: 200, onSwipeLeft: function onSwipeLeft(e) {
							return _this6.setState({ deleting: true });
						}, onSwipeRight: function onSwipeRight(e) {
							return _this6.setState({ deleting: false });
						} },
					React.createElement(
						'div',
						{ className: 'flex-grow flex-column flex-justify-center' },
						React.createElement(
							'span',
							null,
							game.opponent || 'Opponent'
						),
						React.createElement(
							'time',
							{ datetime: game.updated || game.created, title: game.updated || game.created },
							moment(game.updated || game.created).fromNow()
						)
					),
					React.createElement(
						'button',
						{ className: 'btn delete', onClick: this.props.onDelete },
						'Delete'
					)
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
			game: Defaults.game(),
			t: -1
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
			if (nextProps.gameRef) {
				this.setState(this.getInitialState());
				this.bindAsObject(nextProps.gameRef, 'game');
			}
		}
	},
	handleCancel: function handleCancel() {
		if (!this.props.gameRef) return;

		this.unbind('game');
		this.setState(this.getInitialState());
		this.bindAsObject(this.props.gameRef, 'game');
	},
	handleSave: function handleSave() {
		if (!this.props.gameRef) return;

		var game = Object.assign({}, this.state.game);
		game[game.created ? 'updated' : 'created'] = new Date().toISOString();
		delete game['.key'];
		delete game['.value'];
		delete game.$dirty;

		this.props.gameRef.update(game);
	},
	handleClick: function handleClick(i, j, player, previous, e) {
		if (!this.props.gameRef) return alert('You must login first.');

		// @TODO: check/confirm if allowed
		var game = Defaults.game(this.state.game);

		if (e.altKey) {
			// force set/toggle tile
			e.preventDefault();

			var newPlayer = e.type === 'contextmenu' ? 'red' : 'blue';
			if (game.boards[i].tiles[j] === newPlayer) newPlayer = null;

			game.boards[i].tiles[j] = newPlayer;
		} else {
			if (this.state.t >= 0) {
				var removedTurns = game.turns.splice(this.state.t);

				removedTurns.map(function (turn) {
					var _turn = _slicedToArray(turn, 2);

					var i = _turn[0];
					var j = _turn[1];

					game.boards[i].tiles[j] = null;
				});

				this.state.t = -1;
			}

			// make a turn
			game.canChooseAnyTile = null;
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
			game.turns.push(i + j);
			game.turn = game.turn === 'blue' ? 'red' : 'blue';
		}
		game.$dirty = true;
		this.setState({ game: game });
	},
	render: function render() {
		var _this7 = this;

		var _props2 = this.props;
		var me = _props2.me;
		var className = _props2.className;
		var props = _objectWithoutProperties(_props2, ['me', 'className']);
		var game = Defaults.game(this.state.game);
		var origBoards = game.boards;
		var origTurns = game.turns;

		var gameData = _objectWithoutProperties(game, ['boards', 'turns']);

		var t = this.state.t < 0 ? origTurns.length : this.state.t,
		    turns = origTurns.slice(0, Math.max(1, Math.min(t, origTurns.length))),
		    previous = turns[turns.length - 1],
		    boards = Defaults.boards();

		// only show tiles up to active turn
		_.map(origBoards, function (board, i) {
			_.map(board.tiles, function (tile, j) {
				boards[i].tiles[j] = origTurns.indexOf(i + j) < 0 ? tile : turns.indexOf(i + j) >= 0 ? tile : false;
			});
		});

		return React.createElement(
			'div',
			{ className: 'gameview ' + className },
			React.createElement(
				'header',
				null,
				React.createElement(
					'div',
					null,
					React.createElement('span', { className: 'btn mini avatar blue', style: { backgroundImage: 'url(' + (me ? me.profileImageURL : 'avatar.svg') + ')' } }),
					React.createElement(
						'output',
						null,
						me ? me.displayName.replace(/([A-Z])[a-z]*?$/, '$1.') : 'You'
					)
				),
				React.createElement(Tile, { className: 'turn-indicator btn', player: game.turn, letter: game.turn === 'blue' ? game.blue : game.red, onClick: function onClick(e) {
						return _this7.setState({ game: _extends({}, game, { blue: game.red, red: game.blue }) });
					} }),
				React.createElement(
					'div',
					null,
					React.createElement('input', { value: game.opponent || '', placeholder: 'Opponent', size: '8', onChange: function onChange(e) {
							return _this7.setState({ game: _extends({}, game, { opponent: e.target.value, $dirty: true }) });
						} }),
					React.createElement('span', { className: 'btn mini avatar red', style: { backgroundImage: 'url(avatar.svg)' } })
				)
			),
			React.createElement(MegaBoard, _extends({}, gameData, { boards: boards, previous: previous, onClick: this.handleClick })),
			React.createElement(
				'footer',
				null,
				React.createElement(
					'div',
					null,
					React.createElement(
						'button',
						{ className: 'btn red', disabled: !game.$dirty || !game.opponent || !me, onClick: this.handleCancel },
						React.createElement('img', { src: 'icons/cancel.svg', height: '36' })
					)
				),
				React.createElement(
					'div',
					null,
					React.createElement(
						'button',
						{ disabled: t <= 1, className: 'btn', onClick: function onClick(e) {
								return _this7.setState({ t: t - 1, game: _extends({}, game, { turn: game.turn === 'blue' ? 'red' : 'blue' }) });
							} },
						React.createElement('img', { src: 'icons/chevron-left.svg', height: '36' })
					),
					React.createElement(
						'output',
						null,
						t,
						' / ',
						origTurns.length
					),
					React.createElement(
						'button',
						{ disabled: t >= origTurns.length, className: 'btn', onClick: function onClick(e) {
								return _this7.setState({ t: t + 1, game: _extends({}, game, { turn: game.turn === 'blue' ? 'red' : 'blue' }) });
							} },
						React.createElement('img', { src: 'icons/chevron-right.svg', height: '36' })
					)
				),
				React.createElement(
					'div',
					null,
					React.createElement(
						'button',
						{ className: 'btn green', disabled: !game.$dirty || !game.opponent || !me, onClick: this.handleSave },
						React.createElement('img', { src: 'icons/check.svg', height: '32' })
					)
				)
			)
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
		var _props3 = this.props;
		var boards = _props3.boards;
		var className = _props3.className;

		var props = _objectWithoutProperties(_props3, ['boards', 'className']);

		boards = Defaults.boards(boards);

		return React.createElement(
			'div',
			{ className: 'megaboard ' + className },
			mapInOrder(boards, function (board, i) {
				return React.createElement(Board, _extends({ key: i }, props, { i: i, tiles: board.tiles }));
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
			previous: null,
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
		var _props4 = this.props;
		var i = _props4.i;
		var tiles = _props4.tiles;
		var canChooseAnyTile = _props4.canChooseAnyTile;
		var previous = _props4.previous;
		var blue = _props4.blue;
		var red = _props4.red;
		var onClick = _props4.onClick;
		var props = _objectWithoutProperties(_props4, ['i', 'tiles', 'canChooseAnyTile', 'previous', 'blue', 'red', 'onClick']);
		var zIndex = 0;
		tiles = Defaults.tiles(tiles);

		return React.createElement(
			'div',
			{ className: 'board ' + this.getClassName() },
			mapInOrder(tiles, function (tile, j) {
				return React.createElement(Tile, _extends({
					key: j
				}, props, {
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
				}));
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
		var _props5 = this.props;
		var player = _props5.player;
		var letter = _props5.letter;
		var isPrevious = _props5.isPrevious;
		var isBlocked = _props5.isBlocked;
		var className = _props5.className;

		var props = _objectWithoutProperties(_props5, ['player', 'letter', 'isPrevious', 'isBlocked', 'className']);

		return React.createElement(
			'span',
			_extends({}, props, { className: 'tile ' + (player || 'none') + ' ' + (isPrevious ? 'previous' : '') + ' ' + (isBlocked ? 'blocked' : '') + ' ' + className, onContextMenu: this.props.onClick }),
			letter && React.createElement('img', { src: 'icons/' + letter + '.svg' })
		);
	}
});

var ImageScanner = React.createClass({
	displayName: 'ImageScanner',
	getDefaultProps: function getDefaultProps() {
		return {
			onImageChange: function onImageChange(file) {},
			onImageScanned: function onImageScanned(gameData) {}
		};
	},
	scanImage: function scanImage(img) {
		try {
			if (!img.width || !img.height) throw new Error('Invalid image');

			var c = document.createElement('canvas'),
			    ctx = c.getContext('2d');
			c.width = img.width;
			c.height = img.height;

			ctx.drawImage(img, 0, 0);

			var getPixel = {
				x: function x(i, j) {
					return ctx.getImageData(74 + j * 74 + (j >= 6 ? 11 : j >= 3 ? 5 : 0), 436 + i * 74 + (i >= 6 ? 11 : i >= 3 ? 5 : 0), 1, 1).data || [];
				},
				o: function o(i, j) {
					return ctx.getImageData(56 + j * 74 + (j >= 6 ? 11 : j >= 3 ? 5 : 0), 436 + i * 74 + (i >= 6 ? 11 : i >= 3 ? 5 : 0), 1, 1).data || [];
				}
			};

			// scan pixel grid
			var pixels = {};
			for (var i = 0; i < 9; i++) {
				pixels[i] = {};
				for (var j = 0; j < 9; j++) {
					var x = getPixel.x(i, j),
					    o = getPixel.o(i, j);
					if (x[0] === x[1] && x[1] === x[2] && x[2] === x[3]) {
						// claimed X
						pixels[i][j] = { letter: 'x', color: o };
					} else if (o[0] === o[1] && o[1] === o[2] && o[2] === o[3]) {
						// claimed O
						pixels[i][j] = { letter: 'o', color: x };
					} else {
						// gray tile / unclaimed
						pixels[i][j] = { letter: x[0] === x[1] && x[1] === x[2] ? false : null, color: null };
					}
				}
			}

			// transpose into board structure and confirm team colors
			var boards = Defaults.boards(),
			    Is = 'ABCDEFGHI',
			    Js = 'abcdefghi',
			    teams = { x: 'red', o: 'blue', $confirmed: false };
			for (i in pixels) {
				for (var j in pixels[i]) {
					var I = Is[Math.floor(i / 3) * 3 + Math.floor(j / 3)],
					    J = Js[i % 3 * 3 + j % 3];

					boards[I].tiles[J] = pixels[i][j];

					if (pixels[i][j].letter === false && !teams.$confirmed) {
						// we've found a blank tile in an unclaimed board, so let's confirm our teams, if possible
						for (var k in boards[I].tiles) {
							if (boards[I].tiles[k] && boards[I].tiles[k].color) {
								// there's a claimed tile within the same board as the blank tile, so let's align our teams accordingly
								var color = boards[I].tiles[k].color[0] < 50 ? 'blue' : 'red';
								if (teams[boards[I].tiles[k].letter] !== color) {
									// team colors are wrong, flip em
									var tmp = teams.o;
									teams.o = teams.x;
									teams.x = tmp;
								} else {}
								// team colors are right, move on

								// don't check again
								teams.$confirmed = true;
								break;
							}
						}
					}
				}
			}

			// finalize boards taking team color into account
			for (i in boards) {
				for (var j in boards[i].tiles) {
					boards[i].tiles[j] = boards[i].tiles[j].letter ? teams[boards[i].tiles[j].letter] : null;
				}
			}
			return {
				created: new Date().toISOString(),
				boards: boards,
				turn: 'red', // most of the time you'll be using this tool when you have to decide where to play, so the last player to play will have been them (i.e. red)
				blue: teams.x === 'blue' ? 'x' : 'o',
				red: teams.o === 'red' ? 'o' : 'x'
			};
		} catch (err) {
			alert(err);
		}
	},
	handleUpload: function handleUpload(e) {
		var _this8 = this;

		var reader = new FileReader();
		reader.onload = function (e) {
			var img = new Image();
			img.src = e.target.result;

			img.onload = function (e) {
				return _this8.props.onImageScanned(_this8.scanImage(img));
			};
		};
		reader.onerror = function (err) {
			return alert(err);
		};
		reader.readAsDataURL(e.target.files[0]);

		this.props.onImageChange(e.target.files[0]);
	},
	render: function render() {
		return React.createElement('input', { type: 'file', accepts: 'image/png', onChange: this.handleUpload });
	}
});

ReactDOM.render(React.createElement(TicTacticsTools, null), document.getElementById('app'));
