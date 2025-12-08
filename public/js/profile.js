//  Helper Functions 
function getCookie(name) {
    try {
        const value = document.cookie.split("; ").find(row => row.startsWith(name + "=")).split("=")[1];
        return decodeURIComponent(value);
    } catch (e) { return null; }
}

function checkCookie() {
    const username = getCookie("username");
    if (!username) window.location = "login.html";
}

//  Data Loading Functions 

// 1. Load History show only accept 
async function loadBadges() {
    const container = document.getElementById("badgeContainer");
    if (!container) return;
    try {
        const res = await fetch("/userActivities");
        const data = await res.json();
        container.innerHTML = ""; 

        // เอาแค่ accept
        const interestedItems = data.filter(item => item.status === 'accept');

        if(interestedItems.length === 0) {
            container.innerHTML = `<p style="color:#888; grid-column:1/-1; text-align:center;">No interested activities yet.</p>`;
            return;
        }

        
        interestedItems.reverse().forEach(item => {
            const statusClass = "upcoming"; 
            const badgeColor = "status-green";
            const statusText = "INTERESTED";
            const targetId = item.post_id || item.id; 
            
            let imgUrl = 'https://via.placeholder.com/150';
            try {
                let imgs = JSON.parse(item.img);
                if(imgs.length > 0) imgUrl = `img/${imgs[0]}`;
            } catch(e) { if(item.img) imgUrl = `img/${item.img}`; }

            container.innerHTML += `
              <div class="badge-card ${statusClass}" onclick="window.location.href='activity_detail.html?id=${targetId}'" style="cursor: pointer;">
                <img src="${imgUrl}" class="badge-img" onerror="this.src='https://via.placeholder.com/150'">
                <div class="badge-info">
                    <span class="badge-status ${badgeColor}">${statusText}</span>
                    <div class="badge-title">${item.title}</div>
                    <div class="badge-desc">${item.message}</div>
                </div>
              </div>`;
        });
    } catch(e) { console.error(e); }
}

// 2. Load My Posts
async function loadMyPosts() {
    const container = document.getElementById("myPostContainer");
    if(!container) return;
    
    container.innerHTML = "<p style='color:#888;'>Loading...</p>";

    try {
        const res = await fetch("/getMyPosts");
        const data = await res.json();
        container.innerHTML = "";

        if (data.length === 0) {
            container.innerHTML = `<p style="color:#888; grid-column:1/-1; text-align:center;">You haven't created any posts yet.</p>`;
            return;
        }

        data.forEach(p => {
            let imgUrl = 'https://via.placeholder.com/150';
            try {
                let imgs = JSON.parse(p.img);
                if(imgs.length > 0) imgUrl = `img/${imgs[0]}`;
            } catch(e) { if(p.img) imgUrl = `img/${p.img}`; }

            const safePost = JSON.stringify(p).replace(/'/g, "&#39;").replace(/"/g, "&quot;");

            container.innerHTML += `
              <div class="badge-card" style="border-left: 5px solid #3498db;">
                <img src="${imgUrl}" class="badge-img" onerror="this.src='https://via.placeholder.com/150'">
                <div class="badge-info">
                    <div class="badge-title" style="font-size:16px;">${p.title}</div>
                    <div class="badge-desc" style="margin-bottom:15px;">${p.message}</div>
                    
                    <div style="display:flex; gap:10px;">
                        <button onclick='openEditPost(${safePost})' style="padding:6px 12px; background:#26c268; color:white; border:none; border-radius:15px; cursor:pointer; font-size:12px; display:flex; align-items:center; gap:5px;">
                            <i class="fa-solid fa-pen"></i> Edit
                        </button>
                        <button onclick="deletePost(${p.id})" style="padding:6px 12px; background:#ff4757; color:white; border:none; border-radius:15px; cursor:pointer; font-size:12px; display:flex; align-items:center; gap:5px;">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
              </div>`;
        });
    } catch (e) { console.error(e); }
}

//  Action Functions 

// Delete Post
window.deletePost = async function(id) {
    if(!confirm("Are you sure you want to delete this post?")) return;
    try {
        const res = await fetch(`/deletePost/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if(result.success) {
            alert("Deleted successfully");
            loadMyPosts(); 
        } else {
            alert(result.error || "Delete failed");
        }
    } catch(e) { alert("Error deleting post"); }
};

// Open Edit Modal
window.openEditPost = function(post) {
    const modal = document.getElementById("editPostModal");
    document.getElementById("editPostId").value = post.id;
    document.getElementById("editTitle").value = post.title;
    document.getElementById("editMessage").value = post.message;
    if(post.event_date) {
        const d = new Date(post.event_date);
        const dateStr = d.toISOString().split('T')[0];
        document.getElementById("editDate").value = dateStr;
    }
    modal.style.display = "block";
};

// Main Window Load 
window.onload = function () {
    checkCookie();
    const username = getCookie("username");
    const imgCookie = getCookie("img");

    if (document.getElementById("profileName") && username) document.getElementById("profileName").textContent = username;
    if (document.getElementById("profileAvatar")) {
        if (imgCookie && imgCookie !== "undefined" && imgCookie !== "") {
            document.getElementById("profileAvatar").src = "img/" + imgCookie;
        }
    }

    const btnShowMyPosts = document.getElementById("toggleMyPostBtn"); 
    const btnBackToHistory = document.getElementById("backToHistoryBtn"); 
    const tabHistory = document.getElementById("tabHistory");
    const tabMyPosts = document.getElementById("tabMyPosts");

    if (btnShowMyPosts) {
        btnShowMyPosts.onclick = function() {
            if(tabHistory) tabHistory.style.display = "none";
            if(tabMyPosts) tabMyPosts.style.display = "block";
            loadMyPosts();
        };
    }

    if (btnBackToHistory) {
        btnBackToHistory.onclick = function() {
            if(tabMyPosts) tabMyPosts.style.display = "none";
            if(tabHistory) tabHistory.style.display = "block";
        };
    }

    // Avatar Upload
    const changeAvatarBtn = document.getElementById("changeAvatarBtn");
    const avatarFile = document.getElementById("avatarFile");
    const avatarForm = document.getElementById("avatarForm");
    if (changeAvatarBtn && avatarFile) {
        changeAvatarBtn.onclick = () => avatarFile.click();
        avatarFile.onchange = () => { if (avatarFile.files.length > 0) avatarForm.submit(); };
    }

    // Modals
    const openEditBtn = document.getElementById("openEditModal");
    const editModal = document.getElementById("editModal");
    const closeEditBtn = document.getElementById("closeModal");
    if (openEditBtn) openEditBtn.onclick = () => editModal.style.display = "block";
    if (closeEditBtn) closeEditBtn.onclick = () => editModal.style.display = "none";

    const openPostBtn = document.getElementById("openPostModal");
    const postModal = document.getElementById("postModal");
    const closePostBtn = document.getElementById("closePostModal");
    if (openPostBtn) openPostBtn.onclick = () => postModal.style.display = "block";
    if (closePostBtn) closePostBtn.onclick = () => postModal.style.display = "none";

    const editPostModal = document.getElementById("editPostModal");
    const closeEditPostBtn = document.getElementById("closeEditPostModal");
    if(closeEditPostBtn) closeEditPostBtn.onclick = () => editPostModal.style.display = "none";

    window.onclick = function(event) {
        if (event.target == editModal) editModal.style.display = "none";
        if (event.target == postModal) postModal.style.display = "none";
        if (event.target == editPostModal) editPostModal.style.display = "none";
    }

    // Load Default Data
    loadBadges();
};