import { useEffect, useState } from "react";

import FilterButton from '../../components/filterButton/FilterButton';
import SubmitButton from '../../components/submitButton/SubmitButton';

import api from '../../api';

import './SelectRepos.scss';

function SelectRepos(props) {
  const { username, setSelectedRepos } = props;

  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);
  const [ repos, setRepos ] = useState(null);

  useEffect(() => {
    setLoading(true);

    const reposRequest = async () => {
      const result = await api.get(`/users/${username}/repos`);

      if (result.error) {
        setLoading(false);
        setError(true);
        return;
      }

      const repoNames = result.data.map((repo) => repo.name);
      setLoading(false);
      setRepos(repoNames);
    }

    reposRequest();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkReposHandler = (check) => {
    const element = document.getElementsByName('check');
    for(let i=0; i<element.length; i++) {
      element[i].checked = check;
    }
  }

  const submitHandler = () => {
    const element = document.getElementsByName('check');
    const checkedRepos = [];
    for(let i=0; i<element.length; i++) {
      if(element[i].checked) checkedRepos.push(element[i].value);
    }

    setSelectedRepos(checkedRepos);
  }

  const filterButtonsProps = [
    { text: 'Check All', handler: checkReposHandler(true) },
    { text: 'Un-check All', handler: checkReposHandler(false) }
  ];

  return (
    <div className='selectRepos'>
      <h3 className='selectRepos__heading'>Repos</h3>
      {loading && <p>Loading...</p>}
      {error && <p>Error fetching user repos!</p>}
      {repos && 
        <div className='selectRepos__content'>
          <div className='selectRepos__filters'>
            <FilterButton buttons={filterButtonsProps}/>
          </div>
          <div className='selectRepos__list'>
            <ul>
              {repos.map((repoName) => {
                return <li key={repoName}><input type='checkbox' name='check' value={repoName}/>{repoName}</li>
              })}
            </ul>
          </div>
          <SubmitButton handler={submitHandler} text='Submit' />
        </div>
      }
    </div>
  )
}

export default SelectRepos;