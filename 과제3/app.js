class GitHub {
  constructor() {
    this.apiUrl = 'https://api.github.com/users/';
  }

  async getUser(username) {
    const res = await fetch(`${this.apiUrl}${username}`);
    if (!res.ok) throw new Error('사용자를 찾을 수 없습니다.');
    return await res.json();
  }

  async getRepos(username) {
    const res = await fetch(`${this.apiUrl}${username}/repos?sort=updated`);
    return await res.json();
  }
}

class UI {
  constructor() {
    this.profile = document.getElementById('profile');
    this.repos = document.getElementById('repos');
    this.grass = document.getElementById('grass');
    this.spinner = document.getElementById('loading-spinner');
  }

  showSpinner() {
    this.spinner.style.display = 'block';
  }

  hideSpinner() {
    this.spinner.style.display = 'none';
  }

  showProfile(user) {
    this.profile.innerHTML = `
      <div class="card card-body mb-3">
        <div class="row">
          <div class="col-md-3 text-center">
            <img class="img-fluid mb-2" src="${user.avatar_url}" alt="${user.login}" />
            <a href="${user.html_url}" target="_blank" class="btn btn-primary btn-block mb-4">View Profile</a>
          </div>
          <div class="col-md-9">
            <span class="badge badge-primary">Public Repos: ${user.public_repos}</span>
            <span class="badge badge-secondary">Public Gists: ${user.public_gists}</span>
            <span class="badge badge-success">Followers: ${user.followers}</span>
            <span class="badge badge-info">Following: ${user.following}</span>
            <br><br>
            <ul class="list-group">
              <li class="list-group-item">Company: ${user.company || 'null'}</li>
              <li class="list-group-item">
                Website/Blog: ${user.blog ? `<a href="${user.blog}" target="_blank">${user.blog}</a>` : 'null'}
              </li>
              <li class="list-group-item">Location: ${user.location || 'N/A'}</li>
              <li class="list-group-item">Member Since: ${user.created_at}</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  showRepos(repos) {
    this.repos.innerHTML = "<h3 class='page-heading mb-3'>Latest Repos</h3>";
    repos.slice(0, 5).forEach(repo => {
      this.repos.innerHTML += `
        <div class="card card-body mb-2">
          <div class="row">
            <div class="col-md-6">
              <a href="${repo.html_url}" target="_blank">${repo.name}</a>
            </div>
            <div class="col-md-6 repo-badges">
              <span class="badge badge-primary">Stars: ${repo.stargazers_count}</span>
              <span class="badge badge-secondary">Watchers: ${repo.watchers_count}</span>
              <span class="badge badge-success">Forks: ${repo.forks_count}</span>
            </div>
          </div>
        </div>
      `;
    });
  }

  showGrass(username) {
    this.grass.innerHTML = `
      <iframe src="https://ghchart.rshah.org/${username}" frameborder="0"></iframe>
    `;
  }

  showError(msg) {
    this.profile.innerHTML = `<div class="alert alert-danger">${msg}</div>`;
    this.repos.innerHTML = '';
    this.grass.innerHTML = '';
  }

  clearUI() {
    this.profile.innerHTML = '';
    this.repos.innerHTML = '';
    this.grass.innerHTML = '';
  }
}

// 인스턴스
const github = new GitHub();
const ui = new UI();

// 검색 버튼 클릭 이벤트
document.getElementById('searchBtn').addEventListener('click', async () => {
  const username = document.getElementById('usernameInput').value.trim();
  if (!username) return;

  ui.clearUI();
  ui.showSpinner();

  try {
    const user = await github.getUser(username);
    const repos = await github.getRepos(username);
    ui.showProfile(user);
    ui.showRepos(repos);
    ui.showGrass(username);

    // 버튼 숨기기
    document.getElementById('searchBtn').style.display = 'none';
  } catch (err) {
    ui.showError(err.message);
  } finally {
    ui.hideSpinner();
  }
});

// Enter 키로도 검색 가능하게
document.getElementById('usernameInput').addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    document.getElementById('searchBtn').click();
  }
});

// 입력창 클릭 시 버튼 다시 보이게
document.getElementById('usernameInput').addEventListener('focus', () => {
  document.getElementById('searchBtn').style.display = 'inline-block';
});
