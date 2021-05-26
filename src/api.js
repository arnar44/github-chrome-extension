const BASE_URL = 'https://api.github.com';

async function request(method, path, data = '', auth = '') {
  const url = new URL(path, BASE_URL);
  const options = { method, headers: {} };

  if (auth) {
    options.headers['Authorization'] = `Basic ${auth}`;
  }

  if (data) {
      options.headers['content-type'] = 'application/json';
      options.body = JSON.stringify(data);
  }

  let response;
  try {
      response = await fetch(url.href, options);
  } catch (error) {
      console.error('Error', error);
      return { error: true }
  }

  if(!response.ok) {
    return { error: true };
  }
  
  const json = response.status === 204 ? [] : await response.json();

  return { data: json }
}

async function getRepoInfo(auth, repoList, username) {  
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  };

  const getAll = (endpoint) => {
    return repoList.map(async (repoName) => {
      const url = new URL(`/repos/${username}/${repoName}/${endpoint}`, BASE_URL);
      const response = await fetch(url.href, options);
      return response;
    });
  }

  const toJson = (arr) => {
    return arr.map( async (response) => {
      const responseJson = await response.json();
      return responseJson;
    });
  }

  let data;
  try {
    const collaboratorsPromise = getAll('collaborators');
    const pullsPromise = getAll('pulls');
  
    const collaboratorsRes = await Promise.all(collaboratorsPromise);
    const pullsRes = await Promise.all(pullsPromise);
  
    const collaboratorsRaw = toJson(collaboratorsRes);
    const pullsRaw = toJson(pullsRes);
  
  
    const collaborators = await Promise.all(collaboratorsRaw);
    const pulls = await Promise.all(pullsRaw);
  
  
    data = pulls.map((repoPulls, index) => {
      const repoName = repoList[index];
      const repoCollaborators = collaborators[index].reduce((result, collaborator) => {
        if (collaborator.login !== username) {
          result.push(collaborator.login)
        }   
        return result;
      }, []);
  
      return repoPulls.map((pull) => {
        const { id, html_url: pullLink, title, number, user, requested_reviewers: requestedReviewers } = pull;
        const reviewers = requestedReviewers.map((reviewer) => reviewer.login);
        return {
          id,
          repoName,
          collaborators: repoCollaborators,
          pullLink,
          title,
          number,
          madeByBot: user.type === 'Bot',
          reviewers
        }
      })
  
    })

  } catch(error) {
    console.error(error);
    return { error: true };
  }

  return data.flat();
}

const exp = {
  get: request.bind(null, 'GET'),
  remove: request.bind(null, 'DELETE'),
  post: request.bind(null, 'POST'),
  put: request.bind(null, 'PUT'),
  getRepoInfo,
};

export default exp;
