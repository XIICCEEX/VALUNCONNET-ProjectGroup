window.onload = async function () {
    console.log("--- START: Activity Detail ---");

    // 1. จับ Element และเช็คว่ามีจริงไหม
    const loadingState = document.getElementById("loadingState");
    const detailContent = document.getElementById("detailContent");
    const detailImg = document.getElementById("detailImg");
    const viewerMedia = document.querySelector(".viewer-media");

    // === ระบบกันตาย: ตั้งเวลา 3 วินาที ถ้ายังหมุนอยู่ ให้บังคับปิด Loading เลย ===
    setTimeout(() => {
        if (loadingState && loadingState.style.display !== 'none') {
            console.warn("Force closing loader due to timeout.");
            loadingState.style.display = 'none';
            if (detailContent) detailContent.style.display = 'flex';
        }
    }, 3000); 
    // =======================================================================

    // 2. ดึง ID
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        alert("ไม่พบ ID กิจกรรม");
        window.location.href = "Feed.html";
        return;
    }

    try {
        // 3. ดึงข้อมูล
        const res = await fetch("/getPosts");
        if (!res.ok) throw new Error("Server error");
        
        const posts = await res.json();
        const post = posts.find(p => String(p.id) === String(postId));

        if (!post) throw new Error("ไม่พบข้อมูลโพสต์นี้ในระบบ");

        // --- 4. จัดการรูปภาพ (แบบง่ายที่สุด) ---
        let imageList = [];
        try {
            // พยายามแปลง JSON (กรณีหลายรูป)
            imageList = JSON.parse(post.img);
        } catch (e) {
            // ถ้าแปลงไม่ได้ ก็ถือว่าเป็นรูปเดียว
            imageList = post.img ? [post.img] : [];
        }

        // กรองเอาเฉพาะชื่อไฟล์ที่มีค่า
        imageList = imageList.filter(img => img && img.trim() !== "");

        // ถ้าไม่มีรูปเลย
        if (imageList.length === 0) {
            if (detailImg) detailImg.style.display = 'none'; // ซ่อนรูป
            if (viewerMedia) viewerMedia.style.background = '#222'; // ถมดำ
        } else {
            // มีรูป -> โชว์รูปแรก
            showImage(imageList[0]);
            
            // สร้างปุ่มเลื่อนรูป (ถ้ามี > 1 รูป)
            if (imageList.length > 1) {
                setupSlider(imageList);
            }
        }

        // --- 5. ใส่ข้อมูลตัวหนังสือ ---
        setText("detailUser", post.user);
        setText("detailTitle", post.title);
        setText("detailDesc", post.message);
        
        if (document.getElementById("detailAvatar")) {
            const initial = (post.user || "U").charAt(0).toUpperCase();
            document.getElementById("detailAvatar").textContent = initial;
        }

        const dateStr = post.event_date ? new Date(post.event_date).toLocaleDateString() : "-";
        setText("detailDate", dateStr);
        setText("badgeDate", dateStr);

        // --- 6. จบการทำงาน: ปิด Loading / เปิด Content ---
        if (loadingState) loadingState.style.display = "none";
        if (detailContent) detailContent.style.display = "flex";

        // โหลดคอมเมนต์ต่อ (ทำเงียบๆ ไม่ต้องรอ)
        loadComments(postId);
        setupButtons(postId);

    } catch (err) {
        console.error("Critical Error:", err);
        alert("เกิดข้อผิดพลาด: " + err.message);
        // ถึง Error ก็ต้องเปิดหน้านะ
        if (loadingState) loadingState.style.display = "none";
        if (detailContent) detailContent.style.display = "flex";
    }

    // --- ฟังก์ชันย่อย ---

    function showImage(filename) {
        if (!detailImg) return;
        // ถ้าเป็น URL (http) ให้ใช้เลย, ถ้าเป็นชื่อไฟล์ ให้เติม img/
        const src = (filename.startsWith('http') || filename.startsWith('data:')) 
                    ? filename 
                    : `img/${filename}`;
        detailImg.src = src;
        detailImg.style.display = 'block';
    }

    function setupSlider(images) {
        // ลบปุ่มเก่าก่อน
        const old = document.querySelector('.nav-arrow-container');
        if (old) old.remove();

        if (!viewerMedia) return;

        const navDiv = document.createElement("div");
        navDiv.className = "nav-arrow-container";
        navDiv.innerHTML = `
            <button class="nav-arrow nav-prev" id="btnPrev">&#10094;</button>
            <button class="nav-arrow nav-next" id="btnNext">&#10095;</button>
        `;
        viewerMedia.appendChild(navDiv);

        let idx = 0;
        document.getElementById("btnPrev").onclick = () => {
            idx = (idx - 1 + images.length) % images.length;
            showImage(images[idx]);
        };
        document.getElementById("btnNext").onclick = () => {
            idx = (idx + 1) % images.length;
            showImage(images[idx]);
        };
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text || "";
    }

    function setupButtons(postId) {
        // เราลบกดปุ่มไปนะ
        const sendBtn = document.getElementById("detailSendBtn");
        if (sendBtn) {
            sendBtn.onclick = async () => {
                const input = document.getElementById("detailCommentInput");
                const txt = input.value.trim();
                const username = getCookie("username");
                
                if (!txt || !username) return;
                
                try {
                    await fetch('/addComment', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ user: username, post_id: postId, comment: txt })
                    });
                    input.value = "";
                    loadComments(postId);
                } catch(e) { console.error(e); }
            }
        }
    }

    async function handleAction(postId, status) {
        const username = getCookie("username");
        if (!username) return alert("Please login first");
        await fetch("/activity", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: username, post_id: postId, status })
        });
        alert("Saved!");
        window.location.href = "Feed.html";
    }

    async function loadComments(id) {
        const list = document.getElementById("detailCommentList");
        if (!list) return;
        const res = await fetch(`/getComments/${id}`);
        const comments = await res.json();
        
        const count = document.getElementById("commentCount");
        if(count) count.textContent = comments.length;

        list.innerHTML = comments.length ? "" : "<p style='text-align:center;color:#999;margin-top:20px;'>No comments.</p>";
        
        comments.forEach(c => {
            const bg = '#' + Math.floor(Math.random()*16777215).toString(16);
            const letter = (c.user || "U").charAt(0).toUpperCase();
            list.innerHTML += `
                <div class="comment-row">
                    <div class="comm-avatar" style="background:${bg}">${letter}</div>
                    <div class="comm-bubble"><span class="comm-user">${c.user}</span>${c.comment}</div>
                </div>`;
        });
    }

    function getCookie(name) {
        try {
            const v = document.cookie.split("; ").find(r => r.startsWith(name + "=")).split("=")[1];
            return decodeURIComponent(v);
        } catch (e) { return null; }
    }
};