'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TicTacticsTools = React.createClass({
	displayName: 'TicTacticsTools',
	getInitialState: function getInitialState() {
		return {
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
				previous: false,
				turn: 'blue',
				letter: 'x'
			}]
		};
	},
	handleClick: function handleClick(i, j, owner, e) {
		if (e.shiftKey) {
			var newOwner = owner;
			if (!owner) newOwner = 'blue';else if (owner === 'blue') newOwner = 'red';else if (owner === 'red') newOwner = false;

			this.setState(React.addons.update(this.state, {
				megaboards: {
					0: {
						boards: _defineProperty({}, i, {
							tiles: _defineProperty({}, j, { $set: newOwner })
						})
					}
				}
			}));
		} else {
			// @TODO: check if allowed
			var _newOwner = this.state.megaboards[0].turn,
			    nextTurn = _newOwner === 'blue' ? 'red' : 'blue';

			this.setState(React.addons.update(this.state, {
				megaboards: {
					0: {
						boards: _defineProperty({}, i, {
							tiles: _defineProperty({}, j, { $set: _newOwner })
						}),
						previous: { $set: i + j },
						turn: { $set: nextTurn }
					}
				}
			}));
		}
	},
	render: function render() {
		var _this = this;

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
						React.createElement(TurnIndicator, { turn: megaboard.turn, letter: megaboard.letter })
					),
					React.createElement(MegaBoard, _extends({}, megaboard, { onClick: _this.handleClick }))
				);
			}),
			React.createElement(
				'aside',
				null,
				'Sidebar'
			)
		);
	}
});

var TurnIndicator = React.createClass({
	displayName: 'TurnIndicator',
	getDefaultProps: function getDefaultProps() {
		return {
			turn: 'blue',
			letter: 'x'
		};
	},
	render: function render() {
		return React.createElement(
			'div',
			{ className: 'turn-indicator ' + this.props.turn },
			React.createElement('img', { src: (this.props.turn === 'blue' && this.props.letter === 'x' || this.props.turn === 'red' && this.props.letter === 'o' ? 'x' : 'o') + '.svg' })
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
			previous: false,
			turn: 'blue',
			letter: 'x',
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
			}
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
		} else if (!_.some(tiles, function (tile) {
				return !tile;
			})) {
				// it's a tie --> make this a wildcard
				className += ' purple';
			}

		if (this.props.previous) {
			var i = this.props.previous[1].toUpperCase();
			if (i === this.props.i) {
				className += ' active';
			}
		} else {
			className += ' active';
		}
		return className;
	},
	render: function render() {
		var _this2 = this;

		var _props2 = this.props;
		var tiles = _props2.tiles;
		var onClick = _props2.onClick;
		var props = _objectWithoutProperties(_props2, ['tiles', 'onClick']);
		var n = 0;
		return React.createElement(
			'div',
			{ className: 'board ' + this.getClassName() },
			_.map(tiles, function (tile, j) {
				return React.createElement(Tile, _extends({ key: j, j: j, owner: tile, onClick: onClick.bind(_this2, props.i, j), style: { zIndex: 3 - n++ % 3 } }, props));
			})
		);
	}
});

var Tile = React.createClass({
	displayName: 'Tile',
	getClassName: function getClassName() {
		var className = this.props.owner;

		if (this.props.previous) {
			className += ' ' + (this.props.i + this.props.j === this.props.previous ? 'previous' : '') + ' ' + (this.props.j.toUpperCase() + this.props.i.toLowerCase() === this.props.previous ? 'blocked' : '');
		}
		return className;
	},
	render: function render() {
		var _props3 = this.props;
		var owner = _props3.owner;
		var letter = _props3.letter;
		var onClick = _props3.onClick;

		var props = _objectWithoutProperties(_props3, ['owner', 'letter', 'onClick']);

		return React.createElement(
			'button',
			_extends({ className: 'tile ' + this.getClassName(), onClick: onClick.bind(this, owner) }, props),
			owner && React.createElement('img', { src: (owner === 'blue' && letter === 'x' || owner === 'red' && letter === 'o' ? 'x' : 'o') + '.svg' })
		);
	}
});

ReactDOM.render(React.createElement(TicTacticsTools, null), document.getElementById('app'));
