/* global chrome */
import { useState, useEffect } from 'react';

import './App.scss';

import Header from './components/header/Header';
import Login from './pages/login/Login';
import SelectRepos from './pages/selectRepos/SelectRepos';
import Main from './pages/main/Main';

function App() {
  const [ username, setUsername ] = useState('');
  const [ token, setToken ] = useState('');
  const [ selectedRepos, setSelectedRepos ] = useState(null);

  useEffect(()=> {
    chrome.storage.local.get(['gitIssues'], (info)=> {
      if(Object.keys(info).length === 0) {
        return;
      }

      const { storageName, storageToken, storageRepos } = info.gitIssues;

      if(storageName) setUsername(storageName);
      if(storageToken) setToken(storageToken);
      if(storageRepos) setSelectedRepos(storageRepos);
    })
  }, []);

  const submitReposHandler = (repos) => {
    // TODO: Hash token
    const info = {
      gitIssues: {
        storageName: username,
        storageToken: token,
        storageRepos: repos,
      }
    }
    chrome.storage.local.set(info, () => console.log('App: Saved to storage'));

    setSelectedRepos(repos);
  }

  return (
    <div className="app">
      <Header />
      <div className='content'>
        {!token && <Login setUsername={setUsername} setToken={setToken} />}
        {(token && !selectedRepos) && <SelectRepos username={username} setSelectedRepos={submitReposHandler} />}
        {selectedRepos && 
          <Main 
            selectedRepos={selectedRepos}
            username={username}
            token={token}
          />
        }
      </div>

    </div>
  );
}

export default App;
