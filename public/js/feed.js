window.onload = async function () {
    const feedContainer = document.getElementById("feedContainer");
    const emptyState = document.getElementById("emptyState");
    const actionButtons = document.getElementById("actionButtons");

    // ปุ่ม Action (อันนี้เหลือแค่ 2 ปุ่ม)
    const btnAccept = document.getElementById("btnAccept");
    const btnDecline = document.getElementById("btnDecline");

    // ส่วนของ Comment Panel
    const commentList = document.getElementById("commentList");
    const commentText = document.getElementById("commentText");
    const sendCommentBtn = document.getElementById("sendComment");

    let posts = [];
    let index = 0;
    let currentPostId = null;

    // --- 1. โหลดข้อมูล ---
    async function loadPosts() {
        try {
            const res = await fetch("/getPosts");
            posts = await res.json();
            if (posts && posts.length > 0) {
                showPost();
            } else {
                showEmptyState();
            }
        } catch (err) { console.error(err); }
    }

    
    let currentImageIndex = 0; 

    function showPost() {
        if (index >= posts.length) {
            showEmptyState();
            return;
        }

        const p = posts[index];
        currentPostId = p.id;
        const dateDisplay = p.event_date ? new Date(p.event_date).toLocaleDateString() : "Upcoming";
        const interestCount = p.interest_count || 0;

        //  Logic 
        let images = [];
        try {
          
            images = JSON.parse(p.img);
        } catch (e) {
            
            images = [p.img]; 
        }

        
        currentImageIndex = 0;

        
        let sliderControls = '';
        let dotsHtml = '';
        
        if (images.length > 1) {
            sliderControls = `
                <button class="slider-btn prev-btn" onclick="changeSlide(-1)">&#10094;</button>
                <button class="slider-btn next-btn" onclick="changeSlide(1)">&#10095;</button>
            `;
            
           
            let dots = images.map((_, i) => `<div class="dot ${i===0?'active':''}" id="dot-${i}"></div>`).join('');
            dotsHtml = `<div class="slider-dots">${dots}</div>`;
        }

        // HTML
        feedContainer.innerHTML = `
        <div class="card" id="activeCard">
          <a href="activity_detail.html?id=${p.id}" class="expand-btn" title="View Details"><i class="fa-solid fa-expand"></i></a>

          <div class="card-header">
             <i class="fa-solid fa-circle-user"></i> ${p.user || 'Unknown'}
          </div>

          <div class="interest-badge">
             <i class="fa-solid fa-fire"></i> ${interestCount} Interested
          </div>
          
          <div class="image-container">
            <img id="mainPostImage" src="img/${images[0]}" onerror="this.src='https://via.placeholder.com/600x800?text=No+Image';">
            
            ${sliderControls}
            ${dotsHtml}

            <div class="image-overlay"></div>
          </div>
          
          <div class="card-content">
             <div class="post-meta">
                <span class="badge badge-date"><i class="fa-regular fa-calendar"></i> ${dateDisplay}</span>
                <span class="badge badge-loc"><i class="fa-solid fa-location-dot"></i> Bangkok</span>
             </div>
             <div class="post-title">${p.title || 'No Title'}</div>
             <div class="post-desc">${p.message || ''}</div>
          </div>
        </div>
        `;

        
        window.changeSlide = function(direction) {
            currentImageIndex += direction;
            
            
            if (currentImageIndex >= images.length) currentImageIndex = 0;
            if (currentImageIndex < 0) currentImageIndex = images.length - 1;

            // เปลี่ยนรูป
            const imgEl = document.getElementById("mainPostImage");
            imgEl.src = `img/${images[currentImageIndex]}`;

            // อัปเดตจุด
            document.querySelectorAll('.dot').forEach((d, i) => {
                d.classList.toggle('active', i === currentImageIndex);
            });
        };

        if (actionButtons) actionButtons.style.display = "flex";
        if (emptyState) emptyState.classList.remove("active");

        loadComments(currentPostId);
    }

    
    async function loadComments(post_id) {
        commentList.innerHTML = `<p style="text-align:center; color:#999; font-size:12px; margin-top:20px;">Loading comments...</p>`;
        
        try {
            const res = await fetch(`/getComments/${post_id}`);
            const comments = await res.json();
            commentList.innerHTML = ""; 

            if (comments.length === 0) {
                commentList.innerHTML = `<div style="text-align:center; color:#ccc; margin-top:40px; font-size:13px;">No comments yet.<br>Say something!</div>`;
            } else {
                comments.forEach(c => {
                    const avatarLetter = c.user.charAt(0).toUpperCase();
                    const item = document.createElement("div");
                    item.className = "comment-item";
                    item.innerHTML = `
                        <div class="comment-avatar">${avatarLetter}</div>
                        <div class="comment-content-wrapper">
                            <div class="comment-content">
                                <div class="comment-user">${c.user}</div>
                                <div class="comment-text">${c.comment}</div>
                            </div>
                            <span class="reply-btn" data-user="${c.user}">Reply</span>
                        </div>
                    `;
                    commentList.appendChild(item);
                });

               
                document.querySelectorAll('.reply-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const user = this.getAttribute('data-user');
                        commentText.value = `@${user} ` + commentText.value;
                        commentText.focus();
                    });
                });
            }
          
            setTimeout(() => commentList.scrollTop = commentList.scrollHeight, 100);

        } catch (e) { console.error(e); }
    }

    
    sendCommentBtn.addEventListener("click", async () => {
        const txt = commentText.value.trim();
        const username = getCookie("username");

        if (!txt || !currentPostId) return;

        
        sendCommentBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
        
        try {
            await fetch('/addComment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: username, post_id: currentPostId, comment: txt })
            });
            commentText.value = "";
            loadComments(currentPostId); 
        } catch (e) {
            alert("Error sending comment");
        } finally {
            sendCommentBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i>`;
        }
    });

    
    async function handleAction(status) {
        const card = document.getElementById("activeCard");
        if (!card) return;

        // Animation
        card.classList.add(status === 'accept' ? "slide-right" : "slide-left");

        setTimeout(async () => {
            const username = getCookie("username");
            const p = posts[index];
            
            // ยิง API
            fetch("/activity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: username, post_id: p.id, status: status }),
            });

            // เปลี่ยนโพสต์คอมเมนต์จะเปลี่ยนตามเองใน showPost()
            index++;
            showPost(); 
        }, 300);
    }

    if (btnAccept) btnAccept.onclick = () => handleAction("accept");
    if (btnDecline) btnDecline.onclick = () => handleAction("decline");

    function getCookie(name) {
        const row = document.cookie.split("; ").find(r => r.startsWith(name + "="));
        return row ? decodeURIComponent(row.split("=")[1]) : "";
    }

   
    await loadPosts();
};