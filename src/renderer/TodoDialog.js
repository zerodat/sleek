import React, { useState, useRef, useEffect } from 'react';
import { Button, Dialog, DialogContent, DialogActions, FormControl } from '@mui/material';
import AutoSuggest from './AutoSuggest';
import PriorityPicker from './PriorityPicker';
import DatePicker from './DatePicker';
import PomodoroPicker from './PomodoroPicker';
import RecurrencePicker from './RecurrencePicker';
import { Item } from 'jstodotxt';
import './TodoDialog.scss';

const ipcRenderer = window.electron.ipcRenderer;

const TodoDialog = ({ dialogOpen, setDialogOpen, todoObject, attributes, setSnackBarSeverity, setSnackBarContent, setSnackBarOpen }) => {
  const [textFieldValue, setTextFieldValue] = useState(todoObject?.string || '');
  const textFieldRef = useRef(null);

  const handlePriorityChange = (priority) => {
    const updatedTodoObject = new Item(textFieldValue);
    updatedTodoObject.setPriority(priority === '-' ? null : priority);
    setTextFieldValue(updatedTodoObject.toString());
  };

  const handleExtensionChange = (type, response) => {
    const updatedTodoObject = new Item(textFieldValue);
    updatedTodoObject.setExtension(type, response);
    setTextFieldValue(updatedTodoObject.toString());
  };

  const handleAdd = async () => {
    if (!textFieldValue.trim()) {
      setSnackBarSeverity('info');
      setSnackBarContent('Please enter something into the text field');
      setSnackBarOpen(true);
      return;
    }
    try {
      await ipcRenderer.send('writeTodoToFile', todoObject?.id || '', textFieldValue);
      setDialogOpen(false);
    } catch (error) {
      setSnackBarSeverity('error');
      setSnackBarContent('Error');
      setSnackBarOpen(true);
    }
  };

  return (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} id='todoDialog'>
      <DialogContent>
        <AutoSuggest
          attributes={attributes}
          textFieldValue={textFieldValue}
          setTextFieldValue={setTextFieldValue}
          textFieldRef={textFieldRef}
          todoObject={todoObject}
          setDialogOpen={setDialogOpen}
        />

        <PriorityPicker currentPriority={todoObject?.priority} onChange={handlePriorityChange} />

        <DatePicker date={todoObject?.due} type="due" onChange={(date) => handleExtensionChange("due", date)} />

        <DatePicker date={todoObject?.t} type="t" onChange={(date) => handleExtensionChange("t", date)} />

        <RecurrencePicker pomodoro={todoObject?.rec} onChange={(recurrence) => handleExtensionChange("rec", recurrence)} />

        <PomodoroPicker pomodoro={todoObject?.pm} onChange={(pomodoro) => handleExtensionChange("pm", pomodoro)} />
  
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAdd}>Save</Button>
        <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TodoDialog;
