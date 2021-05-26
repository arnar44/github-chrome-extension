import './SubmitButton.scss';

function SubmitButton(props) {
  const { handler, text } = props;

  return (
    <button className='submitButton' onClick={() => handler()}>{text}</button>
  )
}

export default SubmitButton;