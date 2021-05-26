/* global chrome */
import { useState, useEffect } from 'react';

import './Main.scss';

import FilterButton from '../../components/filterButton/FilterButton';
import SubmitButton from '../../components/submitButton/SubmitButton';
import PullItem from '../../components/pullItem/PullItem';
import DetailItem from '../../components/detailItem/DetailItem';

import api from '../../api';

function Main(props) {
  const { selectedRepos, token, username } = props;

  const [ data, setData ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);
  const [ filter, setFilter ] = useState(false);
  const [ show, setShow ] = useState(null);

  useEffect(() => {
    if(!data) {
      setLoading(true);
  
      const getData = async () => {

        const getLocalData = () => {
          return new Promise(resolve => {
            chrome.storage.local.get(['storageData'], (info)=> {
              if(Object.keys(info).length === 0) {
                resolve(false);
              }
  
              const { storageData } = info;
              resolve(storageData);
            })
          })
        }

        const localData = await getLocalData();

        
        if(localData) {
          setLoading(false);
          setData(localData);
          return;
        }

        const auth = Buffer.from(`${username}:${token}`, 'binary').toString('base64');
        const result = await api.getRepoInfo(auth, selectedRepos, username);
        if (result.error) {
          setError(true);
          setLoading(false);
          return;
        }

        saveDataToStorage(result);
        setLoading(false);
      }
  
      getData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveDataToStorage= (newData) => {
    chrome.storage.local.set({storageData: newData}, () => console.log('Main: saved Data'));

    setData(newData);
  }

  const refreshHandler = async () => {
    setError(false);
    setLoading(true);

    const auth = Buffer.from(`${username}:${token}`, 'binary').toString('base64');
    const result = await api.getRepoInfo(auth, selectedRepos, username);

    setLoading(false);
    saveDataToStorage(result);
  }

  const showHandler = (id) => {    
    if(show === id) {
      const element = document.getElementById(id);
      element.className = 'pullDetails__hidden';
      setShow(null);
      return;
    }

    const prevElement = show ? document.getElementById(show) : show;
    
    if (prevElement) prevElement.className = 'pullDetails__hidden';

    const currElement = document.getElementById(id);
    currElement.className = 'pullDetails';
    setShow(id);
  }

  const updateData = (key, value, newData, repoName = '', collaborators = '') => {
    let handledData;
    if (repoName) {
      const { id, html_url: pullLink, title, number, user, requested_reviewers: updatedReviewers } = newData;
      handledData = {
        id,
        repoName,
        collaborators,
        pullLink,
        title,
        number,
        madeByBot: user.type === 'Bot',
        reviewers: updatedReviewers.map( reviewer => reviewer.login)
      }
    }

    handledData = repoName ? handledData : newData;

    const index = data.findIndex( pull => pull[key] === value);
    const filteredData = data.filter(pull => pull[key] !== value);
    filteredData.splice(index, 0, handledData);
    saveDataToStorage(filteredData.flat());
  }

  const collabSubmitHandler = async (remove, repoName, target) => {
    const auth = Buffer.from(`${username}:${token}`, 'binary').toString('base64');
    let result = remove
      ? await api.remove(`/repos/${username}/${repoName}/collaborators/${target}`, '', auth)
      : await api.put(`/repos/${username}/${repoName}/collaborators/${target}`, '', auth);

    if(result.error) {
      return;
    }

    if(!remove) {
      return;
    }

    result = await api.getRepoInfo(auth, [repoName], username);

    if(result.error) {
      return;
    }

    updateData('repoName', repoName, result);
  }

  const reviewerSubmitHandler = async (remove, pull, target) => {
    const auth = Buffer.from(`${username}:${token}`, 'binary').toString('base64');
    const body = { reviewers: [target]};
    
    const result = remove 
      ? await api.remove(`/repos/${username}/${pull.repoName}/pulls/${pull.number}/requested_reviewers`, body, auth)
      : await api.post(`/repos/${username}/${pull.repoName}/pulls/${pull.number}/requested_reviewers`, body, auth);

    if(result.error) {
      console.error(result);
      return;
    }

    updateData('id', pull.id, result.data, pull.repoName, pull.collaborators);
  }

  const addAlarmHandler = (name) => {
    chrome.alarms.create(name, { delayInMinutes: 5 });
  }
  
  const filterProps = [{ text: 'Filter Bot Pulls', handler: () => setFilter(!filter)}];

  return (
    <div className='pulls'>
      <div className='pulls__filters'>
        <FilterButton buttons={filterProps}/>
        <SubmitButton handler={refreshHandler} text='Refresh'/>
      </div>
      <div className='pulls__list'>
        {loading && <p>Loading...</p>}
        {error && <p>Error fetching pulls!</p>}
        {data && data.map((pull) => {
          // eslint-disable-next-line array-callback-return
          if (filter && pull.madeByBot) return;
            const itemName = pull.id === show ? 'pullDetails' : 'pullDetails__hidden';
            return (
              <div className='pulls__item' key={pull.id}>
                <PullItem pull={pull} handler={showHandler} />
                <div className={itemName} id={pull.id}>
                  <div className='pullDetails__forms'>
                    <DetailItem 
                      title='Collaborators' 
                      list={pull.collaborators}
                      removeHandler={collabSubmitHandler.bind(null, true, pull.repoName)}
                      addHandler={collabSubmitHandler.bind(null, false, pull.repoName)}
                    />
                    <DetailItem 
                      title='Requested Reviewers' 
                      list={pull.reviewers}
                      removeHandler={reviewerSubmitHandler.bind(null, true, pull)}
                      addHandler={reviewerSubmitHandler.bind(null, false, pull)}
                    />
                  </div>
                  <SubmitButton handler={() => addAlarmHandler(pull.title)} text='Get Reminder in 5 min' />
                </div>
              </div>
            )
        })}
      </div>
    </div>
  )
}

export default Main;