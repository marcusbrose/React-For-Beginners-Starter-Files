import React from 'react'
import AddFishForm from './AddFishForm'
import base from '../base'

const propTypes = {
  fishes: React.PropTypes.object.isRequired,
  updateFish: React.PropTypes.func.isRequired,
  removeFish: React.PropTypes.func.isRequired,
  addFish: React.PropTypes.func.isRequired,
  loadSamples: React.PropTypes.func.isRequired,
  storeId: React.PropTypes.string.isRequired,
}

class Inventory extends React.Component {

  constructor() {
    super()

    this.handleChange = this.handleChange.bind(this)
    this.authenticate = this.authenticate.bind(this)
    this.authHandler = this.authHandler.bind(this)
    this.logout = this.logout.bind(this)
    this.renderLogin = this.renderLogin.bind(this)
    this.renderInventory = this.renderInventory.bind(this)

    this.state = {
      uid: null,
      owner: null
    }
  }

  componentDidMount() {
    base.onAuth((user) => {
      if (user) {
        this.authHandler(null, { user })
      }
    })
  }

  handleChange(event, key) {
    const fish = this.props.fishes[key]
    const updatedFish = {
      ...fish, 
      [event.target.name]: event.target.value
    }
    this.props.updateFish(key, updatedFish)
  }

  authenticate(provider) {
    base.authWithOAuthPopup(provider, this.authHandler)
  }

  authHandler(error, authData) {
    if (error) {
      console.log(error)
      return
    }

    // grab the store info
    const storeRef = base.database().ref(this.props.storeId)

    // query the firebase once for the store data
    storeRef.once('value', (snapshot) => {
      const data = snapshot.val() || {}
      console.log(data);
      // claim it if there is no owner already
      if ( ! data.owner) {
        storeRef.set({
          owner: authData.user.uid
        })
      }

      this.setState({
        uid: authData.user.uid,
        owner: data.owner || authData.user.uid
      })
    })
  }

  logout() {
    base.unauth()
    this.setState({
      uid: null
    })
  }

  renderLogin() {
    return (
      <nav className="login">
        <h2>Inventory</h2>
        <p>Sign in to manage your store's inventory</p>
        <button className="facebook" onClick={() => this.authenticate('facebook')}>Login with Facebook</button>
      </nav>
    )
  }

  renderInventory(key) {
    const fish = this.props.fishes[key]
    return (
      <div className="fish-edit" key={key}>
        <input type="text" name="name" value={fish.name} placeholder="Fish Name" onChange={(e) => this.handleChange(e, key)} />
        <input type="text" name="price" value={fish.price} placeholder="Fish Price" onChange={(e) => this.handleChange(e, key)} />
        <select name="status" value={fish.status} onChange={(e) => this.handleChange(e, key)}>
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold out!</option>
        </select>
        <textarea type="text" name="desc" value={fish.desc} placeholder="Fish Description" onChange={(e) => this.handleChange(e, key)}></textarea>
        <input type="text" name="image" value={fish.image} placeholder="Fish Image" onChange={(e) => this.handleChange(e, key)} />
        <button type="submit" onClick={() => this.props.removeFish(key)}>Remove Fish</button>
      </div>
    )
  }

  render() {
    const logoutButton = <button onClick={() => this.logout()}>Log Out!</button>
    // check if logged in
    if ( ! this.state.uid) {
      return <div>{this.renderLogin()}</div>
    }
    // check if user is owner of the store
    if (this.state.uid !== this.state.owner) {
      return (
        <div>
          <p>Sorry, you aren't the owner of this store!</p>
          {logoutButton}
        </div>
      )
    }
    return (
      <div>
        <h2>Inventory</h2>
        {logoutButton}
        {Object.keys(this.props.fishes).map(this.renderInventory)}
        <AddFishForm addFish={this.props.addFish} />
        <button onClick={this.props.loadSamples}>
          Load Sample Fishes
        </button>
      </div>
    )
  }
}

Inventory.propTypes = propTypes

export default Inventory