import React from 'react'

const propTypes = {
  tagline: React.PropTypes.string.isRequired,
}

// stateless component, has only render method
const Header = (props) => {
  return (
    <header className="top">
      <h1>
        Catch
        <span className="ofThe">
          <span className="of">of</span>
          <span className="the">the</span>
        </span>
        Day
      </h1>
      <h3 className="tagline"><span>{ props.tagline }</span></h3>
    </header>
  )
}

Header.propTypes = propTypes

export default Header