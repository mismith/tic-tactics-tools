
let TicTacticsTools = React.createClass({
	getInitialState() {
		return {
			me: null,
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
					canChooseAnyTile: true,
					previous: 'Ee',
					turn: 'blue',
					blue: 'x',
					red: 'o',
				},
			],
		};
	},

	componentWillMount() {
		this.firebase = new Firebase('https://mismith.firebaseio.com/tic-tactics-tools');
		this.firebase.onAuth(authData => {
			if (authData) {
				let me = this.firebase.child('users').child(authData.uid);
				me.update(authData[authData.provider]);

				this.firebase.root().child('.info/connected').on('value', snap => {
					if (snap.val()) {
						me.child('online').onDisconnect().set(new Date().toISOString());
						me.child('online').set(true);
					}
				});
			}
			this.setState({me: authData});
		});
	},

	login() {
		this.firebase.authWithOAuthPopup('facebook');
	},
	logout() {
		this.firebase.unauth();
	},

	handleClick(i, j, player, previous, e) {
		if (e.shiftKey) {
			let newPlayer = player;
			if (!player) newPlayer = 'blue';
			else if (player === 'blue') newPlayer = 'red';
			else if (player === 'red') newPlayer = false;

			this.setState(React.addons.update(this.state, {
				megaboards: {
					0: {
						boards: {
							[i]: {
								tiles: {
									[j]: {$set: newPlayer},
								},
							},
						},
					},
				},
			}));
		} else {
			// @TODO: check if allowed

			let newPlayer = this.state.megaboards[0].turn,
				nextTurn = newPlayer === 'blue' ? 'red' : 'blue';

			let canChooseAnyTile = false;
			if (previous) {
				let J = j.toUpperCase(),
					tilesLeftInDestinationBoard = _.filter(this.state.megaboards[0].boards[J].tiles, tile => !tile).length;

				if (
					!tilesLeftInDestinationBoard || // board is already full
					J === i && tilesLeftInDestinationBoard <= 1 // took last tile in own board
				) {
					canChooseAnyTile = true;
				}
			}


			this.setState(React.addons.update(this.state, {
				megaboards: {
					0: {
						boards: {
							[i]: {
								tiles: {
									[j]: {$set: newPlayer},
								},
							},
						},
						canChooseAnyTile: {$set: canChooseAnyTile},
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
			<div>
				<header className="flex-row flex-justify-center">
					<div className="turn-indicator">
						<Tile player={megaboard.turn} letter={megaboard.turn === 'blue' ? megaboard.blue : megaboard.red} />
					</div>
				</header>
				<MegaBoard {...megaboard} onClick={this.handleClick} />
			</div>
		)}
			<aside>
				<button hidden={this.state.me} onClick={this.login}>Login with Facebook</button>
				<button hidden={!this.state.me} onClick={this.logout}>Logout</button>
			</aside>
		</div>
	},
});


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
			canChooseAnyTile: true,
			previous: 'Ee',
			turn: 'blue',
			blue: 'x',
			red: 'o',
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
			canChooseAnyTile: false,
			previous: 'Ee',
			turn: 'blue',
			blue: 'x',
			red: 'o',
			onClick: () => {},
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
			// (player/winner sets className inline above)
		} else if (!_.some(tiles, tile => !tile)) {
			// no active tiles left
			// it's a tie --> make this a wildcard
			className += ' purple';
		}

		if (
			this.props.canChooseAnyTile || 
			this.props.previous && this.props.previous[1].toUpperCase() === this.props.i
		) {
			className += ' active';
		}

		return className;
	},

	render() {
		let {i, tiles, red, blue, previous, canChooseAnyTile, onClick, ...props} = this.props,
			zIndex = 0;

		return <div className={`board ${this.getClassName()}`}>
		{_.map(tiles, (player, j) =>
			<Tile
				key={j}
				player={player}
				letter={player === 'blue' ? blue : (player === 'red' ? red : false)}
				isPrevious={i + j === previous}
				isBlocked={
					j.toUpperCase() + i.toLowerCase() === previous && // can't send back
					_.filter(tiles, tile => !tile).length > 1 // don't block if only one left
				}
				onClick={onClick.bind(this, i, j, player, previous)}
				style={{zIndex: 3-zIndex++%3}}
				{...props}
			/>
		)}
		</div>
	},
});

let Tile = React.createClass({
	render() {
		let {player, letter, isPrevious, isBlocked, ...props} = this.props;

		return <button className={`tile ${player || 'none'} ${isPrevious ? 'previous' : ''} ${isBlocked ? 'blocked' : ''}`} {...props}>
		{letter &&
			<img src={`${letter}.svg`} />
		}
		</button>
	},
});


ReactDOM.render(
	<TicTacticsTools />,
	document.getElementById('app')
);