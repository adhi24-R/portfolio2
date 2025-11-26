document.addEventListener('DOMContentLoaded', () => {
                        const coverPage = document.getElementById('cover-page');
            const openBookBtn = document.getElementById('open-book-btn');
            const storybook = document.getElementById('storybook');
            const tocLinks = document.querySelectorAll('.toc-link');
            const chapters = document.querySelectorAll('.chapter');
            const menuToggle = document.getElementById('menu-toggle');
            const menuClose = document.getElementById('menu-close');
            const toc = document.getElementById('table-of-contents');

           

            // --- Chapter Navigation ---
            function switchChapter(targetId) {
                chapters.forEach(chapter => {
                    chapter.classList.remove('active');
                });

                tocLinks.forEach(link => {
                    link.classList.remove('active-link');
                });

                const targetChapter = document.getElementById(targetId);
                const targetLink = document.querySelector(`.toc-link[data-chapter="${targetId}"]`);
                
                if (targetChapter) {
                    targetChapter.classList.add('active');
                }
                if (targetLink) {
                    targetLink.classList.add('active-link');
                }
            }

            tocLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault(); // Stop the link from trying to jump (#)
                    const chapterId = e.currentTarget.dataset.chapter;
                    switchChapter(chapterId); // Call our page turner function!
                                        if (window.innerWidth <= 768) {
                        toc.classList.remove('toc-open');
                    }
                });
            });
            
            menuToggle.addEventListener('click', () => {
                toc.classList.add('toc-open'); // ...slide the menu down
            });
            
            menuClose.addEventListener('click', () => {
                toc.classList.remove('toc-open'); // ...slide the menu back up
            });

        });