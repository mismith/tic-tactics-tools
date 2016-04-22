
let TicTacticsTools = React.createClass({
	getInitialState() {
		return {
			megaboards: [
				{
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
								i: false,
							},
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
								i: false,
							},
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
								i: false,
							},
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
								i: false,
							},
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
								i: false,
							},
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
								i: false,
							},
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
								i: false,
							},
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
								i: false,
							},
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
								i: false,
							},
						},
					},
					previous: false,
					turn: 'blue',
				},
			],
		};
	},

	handleClick(i, j, owner, e) {
		if (e.shiftKey) {
			let newOwner = owner;
			if (!owner) newOwner = 'blue';
			else if (owner === 'blue') newOwner = 'red';
			else if (owner === 'red') newOwner = false;

			this.setState(React.addons.update(this.state, {
				megaboards: {
					0: {
						boards: {
							[i]: {
								tiles: {
									[j]: {$set: newOwner},
								},
							},
						},
					},
				},
			}));
		} else {
			// @TODO: check if allowed
			let newOwner = this.state.megaboards[0].turn,
				nextTurn = newOwner === 'blue' ? 'red' : 'blue';

			this.setState(React.addons.update(this.state, {
				megaboards: {
					0: {
						boards: {
							[i]: {
								tiles: {
									[j]: {$set: newOwner},
								},
							},
						},
						previous: {$set: i + j},
						turn: {$set: nextTurn},
					},
				},
			}));
		}
	},

	render() {
		return <div className="flex-row">
		{this.state.megaboards.map(megaboard =>
			<MegaBoard {...megaboard} onClick={this.handleClick} />
		)}
			<aside>
				Sidebar
			</aside>
		</div>
	},
})

let MegaBoard = React.createClass({
	getDefaultProps() {
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
						i: false,
					},
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
						i: false,
					},
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
						i: false,
					},
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
						i: false,
					},
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
						i: false,
					},
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
						i: false,
					},
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
						i: false,
					},
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
						i: false,
					},
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
						i: false,
					},
				},
			},
			turn: 'blue',
			previous: false,
			letter: 'o',
			onClick: () => {},
		};
	},

	render() {
		let {boards, ...props} = this.props;
		return <div className="megaboard">
		{_.map(boards, (board, i) =>
			<Board key={i} i={i} tiles={board.tiles} {...props} />
		)}
		</div>
	},
});

let Board = React.createClass({
	getDefaultProps() {
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
				i: false,
			},
		};
	},

	getClassName() {
		let className = '',
			tiles = this.props.tiles;

		if (
			// rows
			(tiles.a === tiles.b && tiles.b === tiles.c && (className = tiles.c)) ||
			(tiles.d === tiles.e && tiles.e === tiles.f && (className = tiles.f)) ||
			(tiles.g === tiles.h && tiles.h === tiles.i && (className = tiles.i)) ||

			// cols
			(tiles.a === tiles.d && tiles.d === tiles.g && (className = tiles.g)) ||
			(tiles.b === tiles.e && tiles.e === tiles.h && (className = tiles.h)) ||
			(tiles.c === tiles.f && tiles.f === tiles.i && (className = tiles.i)) ||

			// diag
			(tiles.a === tiles.e && tiles.e === tiles.i && (className = tiles.i)) ||
			(tiles.c === tiles.e && tiles.e === tiles.g && (className = tiles.g))
		) {
			// this board has been won
		}

		if (this.props.previous && this.props.previous[1].toUpperCase() === this.props.i) {className += ' ' + 'active';
		}
		return className;
	},

	render() {
		let {tiles, onClick, ...props} = this.props;
		return <div className={`board ${this.getClassName()}`}>
		{_.map(tiles, (tile, j) =>
			<Tile key={j} j={j} owner={tile} onClick={onClick.bind(this, props.i, j)} {...props} />
		)}
		</div>
	},
});

let Tile = React.createClass({
	getClassName() {
		let className = this.props.owner;

		if (this.props.previous) {
			className += ' ' + (this.props.i + this.props.j === this.props.previous ? 'previous' : '') + ' ' + (this.props.j.toUpperCase() + this.props.i.toLowerCase() === this.props.previous ? 'blocked' : '');
		}
		return className;
	},

	render() {
		return <button className={`tile ${this.getClassName()}`} onClick={this.props.onClick.bind(this, this.props.owner)}>
		{this.props.owner &&
			<img src={(this.props.owner === 'blue' && this.props.letter === 'x' || this.props.owner === 'red' && this.props.letter === 'o' ? 'x' : 'o') + '.svg'} />
		}
		</button>
	},
});


ReactDOM.render(
	<TicTacticsTools />,
	document.getElementById('app')
);