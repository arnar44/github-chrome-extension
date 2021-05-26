import { Fragment } from 'react';

import './FilterButton.scss';

function FilterButton (props){
  const { buttons } = props;
  
  return (
    <Fragment>
      {buttons.map((button, i) => {
        return (
          <button 
            className='filterButton'
            onClick={() => button.handler()}
            key={i}
          >
            {button.text}
          </button>
        )
      })}
    </Fragment>
  )
}

export default FilterButton;