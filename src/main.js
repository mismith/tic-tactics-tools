function mapInOrder(obj, callback, context) {
	return Object.keys(obj).sort((a,b) => a < b ? -1 : 1).map(k => callback.call(context || this, obj[k], k));
}

let Defaults = {};
Defaults.tiles = function(overrides = {}){
	return _.defaultsDeep(overrides, {
		a: null,
		b: null,
		c: null,
		d: null,
		e: null,
		f: null,
		g: null,
		h: null,
		i: null,
	});
}
Defaults.boards = function(overrides = {}){
	return _.defaultsDeep(overrides, {
		A: {
			tiles: Defaults.tiles(),
		},
		B: {
			tiles: Defaults.tiles(),
		},
		C: {
			tiles: Defaults.tiles(),
		},
		D: {
			tiles: Defaults.tiles(),
		},
		E: {
			tiles: Defaults.tiles(),
		},
		F: {
			tiles: Defaults.tiles(),
		},
		G: {
			tiles: Defaults.tiles(),
		},
		H: {
			tiles: Defaults.tiles(),
		},
		I: {
			tiles: Defaults.tiles(),
		},
	});
}
Defaults.game = function(overrides = {}){
	return _.defaultsDeep(overrides, {
		boards: Defaults.boards(),
		canChooseAnyTile: true,
		previous: 'Ee',
		turn: 'blue',
		blue: 'x',
		red: 'o',
	});
}



let TicTacticsTools = React.createClass({
	mixins: [
		ReactFireMixin,
	],
	getInitialState() {
		return {
			me:      null,
			games:   [],
			gameRef: null,
		};
	},

	componentWillMount() {
		this.firebase = new Firebase('https://mismith.firebaseio.com/tic-tactics-tools');
		this.firebase.onAuth(authData => {
			if (authData) {
				// user profile
				let meRef = this.firebase.child('users').child(authData.uid),
					me    = Object.assign(authData[authData.provider], {uid: authData.uid});
				meRef.update(me);

				// online presence
				this.firebase.root().child('.info/connected').on('value', snap => {
					if (snap.val()) {
						meRef.child('online').onDisconnect().set(new Date().toISOString());
						meRef.child('online').set(true);
					}
				});

				// games
				let gamesRef = this.firebase.child('users:games').child(me.uid),
					gameRef = gamesRef.child(gamesRef.push().key());
				this.bindAsArray(gamesRef, 'games');

				this.setState({me, gameRef});
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
		return <div className="flex-row" style={{width: '100%'}}>
			<Game id="game" gameRef={this.state.gameRef} me={this.state.me} />
			<aside id="sidebar">
				<header>
					<button hidden={this.state.me} onClick={this.login}>Login with Facebook</button>
					<button hidden={!this.state.me} onClick={this.logout}>Logout</button>
				</header>
				<ul className="gameitems">
					<li className="gameitem new" onClick={e => this.setState({gameRef: this.firebaseRefs.games.child(this.firebaseRefs.games.push().key())})}>
						<figure>
							<img src="plus.svg" height="50" />
						</figure>
						<div>New</div>
					</li>
				{this.state.games.sort((a, b) => (a.updated || a.created) > (b.updated || b.created) ? -1 : 1).map(game =>
					<li key={game['.key']} className={`gameitem ${game['.key'] === this.state.gameRef.key() ? 'active' : ''}`} onClick={e => this.setState({gameRef: this.firebaseRefs.games.child(game['.key'])})}>
						<figure>
							<MegaBoard className="mini" {...game} />
						</figure>
						<div>
							<div>
								{game.opponent || 'Opponent'}
							</div>
							<time datetime={game.updated || game.created} title={game.updated || game.created}>
								{moment(game.updated || game.created).fromNow()}
							</time>
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
			game: Defaults.game(),
		};
	},

	componentWillMount() {
		if (this.props.gameRef) {
			this.bindAsObject(this.props.gameRef, 'game');
		}
	},
	componentWillReceiveProps(nextProps) {
		if (this.props.gameRef !== nextProps.gameRef) {
			if (this.firebaseRefs.game) this.unbind('game');
			this.bindAsObject(nextProps.gameRef, 'game');
		}
	},

	handleSave() {
		if (!this.props.gameRef) return;

		let game = Object.assign({}, this.state.game);
		game[game.created ? 'updated' : 'created'] = new Date().toISOString();
		delete game['.key'];
		delete game['.value'];

		this.props.gameRef.update(game);
	},

	handleClick(i, j, player, previous, e) {
		// @TODO: check/confirm if allowed
		let game = Defaults.game(this.state.game);

		if (e.altKey) {
			// force set/toggle tile
			e.preventDefault();

			let newPlayer = e.type === 'contextmenu' ? 'red' : 'blue';
			if (game.boards[i].tiles[j] === newPlayer) newPlayer = null;

			game.boards[i].tiles[j] = newPlayer;
		} else {
			// make a turn
			game.canChooseAnyTile = false;
			if (previous) {
				let J = j.toUpperCase(),
					tilesLeftInDestinationBoard = _.filter(game.boards[J].tiles, tile => !tile).length;

				if (
					!tilesLeftInDestinationBoard || // board is already full
					J === i && tilesLeftInDestinationBoard <= 1 // took last tile in own board
				) {
					game.canChooseAnyTile = true;
				}
			}
			game.boards[i].tiles[j] = game.turn;
			game.previous = i + j;
			game.turn = game.turn === 'blue' ? 'red' : 'blue';
		}
		this.setState({game});
	},

	render() {
		let {me, className, ...props} = this.props,
			game = Defaults.game(this.state.game);

		return <div className={`gameview ${className}`}>
			<header className="flex-row flex-align-center">
				<output>{me ? me.displayName : 'You'}</output>
				<div className="turn-indicator">
					<Tile player={game.turn} letter={game.turn === 'blue' ? game.blue : game.red} />
				</div>
				<input value={game.opponent || ''} placeholder="Opponent name" onChange={e => this.setState({game: {...game, opponent: e.target.value}})} />
				<button className="btn green-faded" disabled={!game.opponent} onClick={this.handleSave}>
					<img src="check.svg" height="36" />
				</button>
			</header>
			<MegaBoard onClick={this.handleClick} {...game} />
		</div>
	},
});

let MegaBoard = React.createClass({
	getDefaultProps() {
		return {
			boards: Defaults.boards(),
		};
	},

	render() {
		let {boards, className, ...props} = this.props;
		boards = Defaults.boards(boards);

		return <div className={`megaboard ${className}`}>
		{mapInOrder(boards, (board, i) =>
			<Board key={i} i={i} tiles={board.tiles} {...props} />
		)}
		</div>
	},
});

let Board = React.createClass({
	getDefaultProps() {
		return {
			tiles: Defaults.tiles(),
			i: 'A',
			canChooseAnyTile: false,
			blue: 'x',
			red: 'o',
			onClick: () => {},
		};
	},

	getClassName() {
		let className = '',
			tiles = Defaults.tiles(this.props.tiles);

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
		} else if (_.filter(tiles, tile => !tile).length === 0) {
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
		tiles = Defaults.tiles(tiles);

		return <div className={`board ${this.getClassName()}`}>
		{mapInOrder(tiles, (tile, j) =>
			<Tile
				key={j}
				player={tile || null}
				letter={tile === 'blue' ? blue : (tile === 'red' ? red : false)}
				isPrevious={i + j === previous}
				isBlocked={
					j.toUpperCase() + i.toLowerCase() === previous && // can't send back
					_.filter(tiles, tile2 => !tile2).length > 1 // don't block if only one left
				}
				onClick={onClick.bind(null, i, j, tile, previous)}
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