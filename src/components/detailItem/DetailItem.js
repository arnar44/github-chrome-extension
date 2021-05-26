import { useState } from 'react';

import './DetailItem.scss';

function DetailItem(props) {
  const { title, list, removeHandler, addHandler } = props;

  const [ value, setValue ] = useState('');

  const clickHandler = () => {
    addHandler(value);
    setValue('');
  }

  return (
    <div className='detailItem'>
      <h4 className='detailItem__head'>{title}</h4>
      <div className='detailItem__list'>
        {list.map((item, i) => {
          return (
            <div className='item' key={i}>
              <p className='item__name'>{item}</p>
              <span className='item__remove' onClick={() => removeHandler(item)}>x</span>
            </div>
          )
        })}
      </div>
      <div className='detailForm'>
        <input 
          className='detailForm__input'
          placeholder='Github Username'
          type='text'
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button className='detailForm__button' onClick={() => clickHandler()}>Add</button>
      </div>
    </div>
  )
}

export default DetailItem;