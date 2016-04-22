let Defaults = {
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
};

let TicTacticsTools = React.createClass({
	mixins: [
		ReactFireMixin,
	],
	getInitialState() {
		return {
			me:    null,
			games: [],
			selectedGameId: location.hash.substring(1),
		};
	},

	componentWillMount() {
		this.firebase = new Firebase('https://mismith.firebaseio.com/tic-tactics-tools');
		this.firebase.onAuth(authData => {
			if (authData) {
				let meRef = this.firebase.child('users').child(authData.uid),
					me    = Object.assign(authData[authData.provider], {uid: authData.uid});
				meRef.update(me);

				this.firebase.root().child('.info/connected').on('value', snap => {
					if (snap.val()) {
						meRef.child('online').onDisconnect().set(new Date().toISOString());
						meRef.child('online').set(true);
					}
				});

				this.bindAsArray(this.firebase.child('users:games').child(me.uid), 'games');

				this.setState({me});
			} else {
				this.setState({me: authData});
			}
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
			<Game gamesRef={this.firebase.child('users:games').child(this.state.me.uid)} id={this.state.selectedGameId} me={this.state.me} />
			<aside>
				<header>
					<button hidden={this.state.me} onClick={this.login}>Login with Facebook</button>
					<button hidden={!this.state.me} onClick={this.logout}>Logout</button>
				</header>
				<ul>
				{this.state.games.map(game =>
					<li key={game['.key']} className="gameitem flex-row">
						<div>
							<MegaBoard className="mini" {...game} />
						</div>
						<div style={{flexGrow: 1}}>
							{game.opponent}
						</div>
						<div>
							{game.updated}
						</div>
					</li>
				)}
				</ul>
			</aside>
		</div>
	},
});


let Game = React.createClass({
	mixins: [
		ReactFireMixin,
	],
	getInitialState() {
		return {
			game: {
				boards: Defaults.boards,
				canChooseAnyTile: true,
				previous: 'Ee',
				turn: 'blue',
				blue: 'x',
				red: 'o',
			},
		};
	},

	componentWillMount() {
		if (this.props.gamesRef && this.props.id) {
			this.bindAsObject(this.props.gamesRef.child(this.props.id), 'game');
		}
	},

	handleSave() {
		if (!this.props.gamesRef) return;

		let game = Object.assign({}, this.state.game);

		if (game['.key']) {
			delete game['.key'];
			game.updated = new Date().toISOString();

			this.props.gamesRef.child(this.props.id).update(game);
		} else {
			game.created = new Date().toISOString();

			let id = this.props.gamesRef.push(game).key();

			this.props.id = id;
			location.hash = key;
		}
	},

	handleClick(i, j, player, previous, e) {
		// @TODO: check/confirm if allowed
		if (e.altKey) {
			// force set/toggle tile
			e.preventDefault();

			if (!this.state.game) this.state.game = {};
			if (!this.state.game.boards) this.state.game.boards = {};
			if (!this.state.game.boards[i]) this.state.game.boards[i] = {};
			if (!this.state.game.boards[i].tiles) this.state.game.boards[i].tiles = {};

			let newPlayer = e.type === 'contextmenu' ? 'red' : 'blue';
			if (this.state.game.boards[i].tiles[j] === newPlayer) newPlayer = null;

			this.setState({
				game: {
					...this.state.game,
					boards: {
						...this.state.game.boards,
						[i]: {
							...this.state.game.boards[i],
							tiles: {
								...this.state.game.boards[i].tiles,
								[j]: newPlayer,
							},
						},
					},
				},
			});
		} else {
			// make a turn
			let newPlayer = this.state.game.turn,
				nextTurn = newPlayer === 'blue' ? 'red' : 'blue';

			let canChooseAnyTile = null;
			if (previous) {
				let J = j.toUpperCase(),
					tilesLeftInDestinationBoard = _.filter(Defaults.tiles, (nil, jj) => {
						return !(this.state.game.boards[J] && this.state.game.boards[J].tiles && this.state.game.boards[J].tiles[jj]);
					}).length;

				if (
					!tilesLeftInDestinationBoard || // board is already full
					J === i && tilesLeftInDestinationBoard <= 1 // took last tile in own board
				) {
					canChooseAnyTile = true;
				}
			}

			if (!this.state.game) this.state.game = {};
			if (!this.state.game.boards) this.state.game.boards = {};
			if (!this.state.game.boards[i]) this.state.game.boards[i] = {};
			if (!this.state.game.boards[i].tiles) this.state.game.boards[i].tiles = {};
			this.setState({
				game: {
					...this.state.game,
					boards: {
						...this.state.game.boards,
						[i]: {
							...this.state.game.boards[i],
							tiles: {
								...this.state.game.boards[i].tiles,
								[j]: newPlayer,
							},
						},
					},
					canChooseAnyTile: canChooseAnyTile,
					previous: i + j,
					turn: nextTurn,
				},
			});
		}
	},

	render() {
		let {me, className, ...props} = this.props;
		let {game} = this.state;
		return <div className={`gameview ${className}`}>
			<header className="flex-row flex-align-center">
				<output>{me.displayName}</output>
				<div className="turn-indicator">
					<Tile player={game.turn} letter={game.turn === 'blue' ? game.blue : game.red} />
				</div>
				<input value={game.opponent || ''} placeholder="Opponent name" onChange={e => this.setState({game: {...this.state.game, opponent: e.target.value}})} />
			</header>
			<MegaBoard onClick={this.handleClick} {...game} />
			<footer className="flex-row flex-align-center">
				<button onClick={this.handleSave}>Save</button>
			</footer>
		</div>
	},
});

let MegaBoard = React.createClass({
	getDefaultProps() {
		return {
			boards: Defaults.boards,
		};
	},

	render() {
		let {boards, className, ...props} = this.props;
		return <div className={`megaboard ${className}`}>
		{_.map(Defaults.boards, (nil, i) =>
			<Board key={i} i={i} tiles={boards[i] ? boards[i].tiles : Defaults.tiles} {...props} />
		)}
		</div>
	},
});

let Board = React.createClass({
	getDefaultProps() {
		return {
			tiles: Defaults.tiles,
			i: 'A',
			canChooseAnyTile: null,
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
			(tiles.a === tiles.b && tiles.b === tiles.c && (className = tiles.c || '')) ||
			(tiles.d === tiles.e && tiles.e === tiles.f && (className = tiles.f || '')) ||
			(tiles.g === tiles.h && tiles.h === tiles.i && (className = tiles.i || '')) ||

			// cols
			(tiles.a === tiles.d && tiles.d === tiles.g && (className = tiles.g || '')) ||
			(tiles.b === tiles.e && tiles.e === tiles.h && (className = tiles.h || '')) ||
			(tiles.c === tiles.f && tiles.f === tiles.i && (className = tiles.i || '')) ||

			// diag
			(tiles.a === tiles.e && tiles.e === tiles.i && (className = tiles.i || '')) ||
			(tiles.c === tiles.e && tiles.e === tiles.g && (className = tiles.g || ''))
		) {
			// this board has been won
			// (player/winner sets className inline above)
		} else if (_.filter(Defaults.tiles, (nil, jj) => !tiles[jj]).length === 0) {
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
		{_.map(Defaults.tiles, (nil, j) =>
			<Tile
				key={j}
				player={tiles[j] || null}
				letter={tiles[j] === 'blue' ? blue : (tiles[j] === 'red' ? red : false)}
				isPrevious={i + j === previous}
				isBlocked={
					j.toUpperCase() + i.toLowerCase() === previous && // can't send back
					_.filter(Defaults.tiles, (nil, jj) => !tiles[jj]).length > 1 // don't block if only one left
				}
				onClick={onClick.bind(this, i, j, tiles[j], previous)}
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

		return <button className={`tile ${player || 'none'} ${isPrevious ? 'previous' : ''} ${isBlocked ? 'blocked' : ''}`} onContextMenu={this.props.onClick} {...props}>
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