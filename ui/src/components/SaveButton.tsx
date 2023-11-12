interface SaveButtonProps {
  disabled: boolean;
  handleSave: React.MouseEventHandler<HTMLButtonElement>
}

const SaveButton = (props: SaveButtonProps) => {
  const { disabled, handleSave } = props;
  return (
    <button className='disabled:opacity-75 disabled:bg-gray-500 disabled:border-transparent disabled:hover:border-transparent enabled:hover:border-blue-500' disabled={disabled} onClick={handleSave}>SaveButton</button>
  )
}

export default SaveButton