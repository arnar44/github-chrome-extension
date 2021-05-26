import './PullItem.scss';

function PullItem(props) {
  const { pull, handler } = props;

  return (
    <div className='pullHead' onClick={() => handler(pull.id)}>
      <p className='pullItem'>{pull.repoName}</p>
      <p className='pullItem'>{pull.number}</p>
      <p className='pullItem'>{pull.title}</p>
      {pull.madeByBot && <p className='pullItem__icon'>Bot</p>}
      <a className='pullItem__link' href={pull.pullLink} rel='noreferrer' target='_blank'>Go To Pull</a>
    </div>
  )
}

export default PullItem;