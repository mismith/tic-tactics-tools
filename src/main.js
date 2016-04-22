let TicTacticsTools = React.createClass({
	getInitialState() {
		return {
			me: null,
			game: {},
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

	render() {
		return <div className="flex-row">
			<Game {...this.state.game} />
			<aside>
				<button hidden={this.state.me} onClick={this.login}>Login with Facebook</button>
				<button hidden={!this.state.me} onClick={this.logout}>Logout</button>
			</aside>
		</div>
	},
});


let Game = React.createClass({
	getInitialState() {
		return {
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
						i: null,
					},
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
						i: null,
					},
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
						i: null,
					},
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
						i: null,
					},
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
						i: null,
					},
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
						i: null,
					},
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
						i: null,
					},
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
						i: null,
					},
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
						i: null,
					},
				},
			},
			canChooseAnyTile: true,
			previous: 'Ee',
			turn: 'blue',
			blue: 'x',
			red: 'o',
		};
	},

	handleClick(i, j, player, previous, e) {
		// @TODO: check/confirm if allowed
		if (e.shiftKey) {
			// toggle tile

			let newPlayer = player;
			if (!player) newPlayer = 'blue';
			else if (player === 'blue') newPlayer = 'red';
			else if (player === 'red') newPlayer = false;

			this.setState(React.addons.update(this.state, {
				boards: {
					[i]: {
						tiles: {
							[j]: {$set: newPlayer},
						},
					},
				},
			}));
		} else {
			// make a turn

			let newPlayer = this.state.turn,
				nextTurn = newPlayer === 'blue' ? 'red' : 'blue';

			let canChooseAnyTile = false;
			if (previous) {
				let J = j.toUpperCase(),
					tilesLeftInDestinationBoard = _.filter(this.state.boards[J].tiles, tile => !tile).length;

				if (
					!tilesLeftInDestinationBoard || // board is already full
					J === i && tilesLeftInDestinationBoard <= 1 // took last tile in own board
				) {
					canChooseAnyTile = true;
				}
			}

			this.setState(React.addons.update(this.state, {
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
			}));
		}
	},

	render() {
		return <div className="game">
			<header className="flex-row flex-justify-center">
				<div className="turn-indicator">
					<Tile player={this.state.turn} letter={this.state.turn === 'blue' ? this.state.blue : this.state.red} />
				</div>
			</header>
			<MegaBoard {...this.state} onClick={this.handleClick} />
		</div>
	},
});

let MegaBoard = React.createClass({
	getDefaultProps() {
		return {
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
						i: null,
					},
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
						i: null,
					},
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
						i: null,
					},
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
						i: null,
					},
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
						i: null,
					},
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
						i: null,
					},
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
						i: null,
					},
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
						i: null,
					},
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
						i: null,
					},
				},
			},
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
				a: null,
				b: null,
				c: null,
				d: null,
				e: null,
				f: null,
				g: null,
				h: null,
				i: null,
			},
			i: 'A',
			canChooseAnyTile: false,
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
			(this.props.previous && this.props.previous[1].toUpperCase() === this.props.i)
		) {
			className += ' active';
		}

		return className;
	},

	render() {
		let {i, tiles, canChooseAnyTile, previous, blue, red, onClick, ...props} = this.props,
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
	getDefaultProps() {
		return {
			player: 'blue',
			letter: 'x',
		};
	},

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