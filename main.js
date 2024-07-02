const postsDiv = document.getElementById('posts-div')
const loginBtn = document.getElementById('login-btn')
const logoutBtn = document.getElementById('logout-btn')
const regsterBtn = document.getElementById('regster-btn')
const postBtn = document.getElementById('post-btn')
const navProfileDiv = document.getElementById('nav-profile')

let beasURL = 'https://tarmeezacademy.com/api/v1'

let postEditId

let pageCount = 1
let pageCountHandle = true

let editPostHandel
function editPostHandelFun(val) { editPostHandel = val }

// Get and Create Posts
function getPost() {
    axios.get(beasURL + `/posts?limit=4&page=${pageCount}`)
        .then(res => {
            res.data.data.forEach(el => {
                if (postsDiv) postsDiv.append(createPosts(el))
            })
            toggleLoader(false)
            pageCountHandle = true
        })
}

function createPosts(data) {
    const postDataStr = JSON.stringify(data)
    let EB = ''
    let DB = ''
    if (localStorage.getItem('user')) {
        DB = data.author.id == JSON.parse(localStorage.getItem('user')).id ? `<botton id='delete-btn' class='btn btn-outline-danger me-1' onclick='deletePost(${postDataStr})' style='z-index:99;'>Delete</botton>` : ''
        EB = data.author.id == JSON.parse(localStorage.getItem('user')).id ? `<botton id='edit-btn' class='btn btn-outline-secondary' onclick='editPost(${postDataStr})' style='z-index:99;'>Edit</botton>` : ''
    }
    let div = document.createElement('div')
    div.id = data.id
    div.innerHTML = `
            <div id="post-card" class="card border-success mb-3">
                <div class="card-header bg-transparent border-success  d-flex ">
                    <div onclick='profileClick(${data.author.id})'>
                        <img class="rounded-circle" src="${data.author['profile_image']}" style="width: 40px;height: 40px;">
                        <span class="fw-bold">@${data.author.username}</span>
                    </div>
                    <div class="ms-auto">${DB}${EB}</div>
                </div>
                <div class="card-body" onclick="postClick(${data.id})">
                    <img class="img-fluid rounded" src="${data.image}" alt="Null">
                    <h6 class="text-black-50 mt-1">${data.created_at}</h6>
                    <h5 class="card-title">${data.title || ''}</h5>
                    <p class="card-text">${data.body}</p>
                </div>
                <div class="card-footer bg-transparent border-success" onclick="postClick(${data.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-pen" viewBox="0 0 16 16">
                        <path
                            d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
                    </svg>
                    <span class="text-secondary">(${data['comments_count']}) Comments</span>
                    <div class="float-end">${createTags(data.tags)}</div>
                </div>
            </div>
        `
    return div
}

function createTags(arr) {
    let tags = ''
    arr.forEach(el => {
        tags += `<span class="me-1 px-1 rounded bg-body-secondary">${el.name}</span>`
    })
    return tags
}


function postClick(id) {
    location = `detalisPost.html?id=${id}`
}

function profileClick(id) {
    location = `profile.html?id=${id}`
}

// anfinte limit of scroll
window.addEventListener('scroll', () => {
    let endPage = window.scrollY >= document.body.scrollHeight - (window.innerHeight * 2)
    if (endPage) {
        if (pageCountHandle) {
            pageCount++
            getPost()
            pageCountHandle = false
        }
    }
})




// register
regsterBtn.addEventListener('click', () => {
    let formData = new FormData()
    formData.append('username', document.getElementById('regster-username').value)
    formData.append('name', document.getElementById('regster-name').value)
    formData.append('email', document.getElementById('regster-email').value)
    formData.append('password', document.getElementById('regster-pass').value)
    formData.append('image', document.getElementById('regster-image').files[0])
    toggleLoader(true, true)
    axios.post(beasURL + '/register', formData)
        .then(res => {
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('user', JSON.stringify(res.data.user))
            bootstrap.Modal.getInstance(document.getElementById("regster-modal")).hide()
            showAleart('Welcome ' + res.data.user.name + ' You Are Register')
            loginLogoutCheck()
        })
        .catch(error => {
            showAleart(error.response.data.message, 'danger')
                (error, 'danger')
        }).finally(() => {
            toggleLoader(false)
        })
})




// login
loginBtn.addEventListener('click', login)
function login() {
    let body = {
        'username': document.getElementById('login-username').value,
        'password': document.getElementById('login-pass').value
    }
    toggleLoader(true, true)
    axios.post(beasURL + '/login', body)
        .then(res => {
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('user', JSON.stringify(res.data.user))
            bootstrap.Modal.getInstance(document.getElementById("login-modal")).hide()
            showAleart('Welcome ' + res.data.user.name + ' You Are Login')
            loginLogoutCheck()
        })
        .catch(error => {
            showAleart(error.response.data.message, 'danger')
        }).finally(() => {
            toggleLoader(false)
        })
}




// Post
if (postBtn) postBtn.addEventListener('click', function () {
    let formData = new FormData()
    formData.append('title', document.getElementById('post-title').value)
    formData.append('body', document.getElementById('post-body').value)
    formData.append('image', document.getElementById('post-image').files[0])

    let headers = {
        'Content-Type': 'multipart/form-data',
        'authorization': `Bearer ${localStorage.getItem('token')}`
    }

    let url = beasURL + '/posts'
    if (editPostHandel) {
        url = beasURL + '/posts/' + postEditId
        formData.append('_method', 'put')
    }
    toggleLoader(true, true)
    axios.post(url, formData, { headers: headers })
        .then(res => {
            bootstrap.Modal.getInstance(document.getElementById("add-post-modal")).hide()
            showAleart('Post Added')
            editPostHandel ? document.getElementById(res.data.data.id).parentNode.replaceChild(createPosts(res.data.data), document.getElementById(res.data.data.id)) : postsDiv.prepend(createPosts(res.data.data))
        })
        .catch(error => {
            showAleart(error.response.data.message, 'danger')
        }).finally(() => {
            toggleLoader(false)
        })
})






// Create Navbar Profile
function createNavProfile(name, URL) {
    navProfileDiv.innerHTML = `
        <div class="d-flex">
            <img class="img-fluid rounded-circle me-1" src="${URL}" style="width:30px;height:30px;">
            <h6 class="text-black-50 mx-2 mt-2" style="font-size:14px;">${name}</h6>
        </div>
    `
}


// Aleart
function showAleart(CustoMessamge, alertColor) {
    // document.body.innerHTML += '<div id="liveAlertPlaceholder" class="" style="position: fixed;bottom: 10px; right: 10px; z-index: 99; min-width: 300px;opacity: 0.9;"></div>'
    const div = document.createElement('div')
    div.id = 'liveAlertPlaceholder'
    div.className = 'aleart-div fade show'
    document.body.prepend(div)
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('')
        alertPlaceholder.append(wrapper)
    }
    appendAlert(CustoMessamge || '', alertColor || 'success')
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance('#liveAlertPlaceholder')
        alert.close()
    }, 3500);
}



loginLogoutCheck()
function loginLogoutCheck() {
    const login = document.getElementById('login-show')
    const regster = document.getElementById('regster-show')
    const logout = document.getElementById('logout-btn')
    const addPostShow = document.getElementById('add-post-show')
    const inputGroup = document.getElementById('input-group-div')
    const profileLink = document.getElementById('profile-link')
    const user = JSON.parse(localStorage.getItem('user'))
    if (localStorage.getItem('token') && user) {
        profileLink.setAttribute('aria-disabled', 'false')
        profileLink.classList.remove('disabled')
        login.style.display = 'none'
        regster.style.display = 'none'
        logout.style.display = ''
        if (addPostShow) addPostShow.style.display = ''
        createNavProfile(user.name, user['profile_image'])
        if (inputGroup) inputGroup.style.display = ''
    } else {

        profileLink.setAttribute('aria-disabled', 'true')
        profileLink.classList.add('disabled')
        login.style.display = ''
        regster.style.display = ''
        logout.style.display = 'none'
        if (addPostShow) addPostShow.style.display = 'none'
        navProfileDiv.innerHTML = ''
        if (inputGroup) inputGroup.style.display = 'none'
    }
}
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    loginLogoutCheck()
    showAleart('You Are Logout', 'danger')
})


function addPostShowFun() {
    editPostHandelFun(false)
    document.getElementById('add-post-head').innerHTML = 'Post'
    document.getElementById('post-title').value = ''
    document.getElementById('post-body').value = ''
}


function editPost(data) {
    // const data = JSON.parse(dataStr)
    editPostHandelFun(true)
    postEditId = data.id
    document.getElementById('add-post-head').innerHTML = 'Edit Post'
    document.getElementById('post-title').value = data.title
    document.getElementById('post-body').value = data.body
    let editModal = new bootstrap.Modal(document.getElementById('add-post-modal'))
    postBtn.onclick = ''
    editModal.toggle()
}
function deletePost(data) {
    const conf = confirm('Are you sure you want to delete?')
    if (conf) {
        toggleLoader(true, true)
        axios.delete(beasURL + '/posts/' + data.id, { headers: { 'authorization': `Bearer ${localStorage.getItem('token')}` } })
            .then(res => {
                document.getElementById(data.id).remove()
                showAleart('Deleted')
            }).catch(error => {
                showAleart(error.response.data.message, 'danger')
            }).finally(() => {
                toggleLoader(false)
            })
    }
}


// loader
function toggleLoader(show = true, bg = false) {
    const loader = document.getElementById('loader')
    if (bg) loader.style.backgroundColor = 'transparent'
    if (show) {
        loader.style.visibility = 'visible'
    } else {
        loader.style.visibility = 'hidden'
    }
}