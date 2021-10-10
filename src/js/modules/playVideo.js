export default class VideoPlayer {
    constructor(triggers, overlay) {
        this.btns = document.querySelectorAll(triggers);
        this.overlay = document.querySelector(overlay);
        this.close = this.overlay.querySelector('.close');
        this.onPlayerStateChange = this.onPlayerStateChange.bind(this); //! жорстко прив'язуємо контекст виклику до цього методу і класу
    }

    bindTriggers() {
        this.btns.forEach((btn, i) => {
            try {
                const blockedElem = btn.closest('.module__video-item').nextElementSibling;

                if (i % 2 == 0) {
                    blockedElem.setAttribute('data-disabled', 'true'); //! ставимо атрибут для блоку елементу
                }
            } catch(e){}

            btn.addEventListener('click', () => {
                if (!btn.closest('.module__video-item') || btn.closest('.module__video-item').getAttribute('data-disabled') !== 'true') { //! якщо блок не заблокований
                    this.activeBtn = btn; //? отримуємо активну кнопку

                    if (document.querySelector('iframe#frame')) { //! визначаємо чи вже викликано плеєр і якщо так, то ми лише активовуємо плеєр без його генерації
                        this.overlay.style.display = 'flex';
                        if (this.path !== btn.getAttribute('data-url')) { //! якщо ми клікаємо на інше відео, то запускаємо функціонал вище
                            this.path = btn.getAttribute('data-url');
                            this.player.loadVideoById({videoId: this.path});
                        }
                    } else {
                        this.path = btn.getAttribute('data-url');

                        this.createPlayer(this.path);
                    }
                }
            });
        });
    }

    bindCloseBtn() {
        this.close.addEventListener('click', () => {
            this.overlay.style.display = 'none';
            this.player.stopVideo();
        });
    }

    createPlayer(url) {
        this.player = new YT.Player('frame', {
            height: '100%',
            width: '100%',
            videoId: `${url}`,
            events: {
                'onStateChange': this.onPlayerStateChange //! метод виконується при зміні стану плеєра
            }
        });

        this.overlay.style.display = 'flex';
    }

    //   //! метод спрацює при зміні стану плеєра
    onPlayerStateChange(state) {
        try {
            const blockedElem = this.activeBtn.closest('.module__video-item').nextElementSibling; //? отримаємо наступний плеєр від активного на даний момент (заблокований плеє)
            const playBtn = this.activeBtn.querySelector('svg').cloneNode(true); //! копіюємо svg структуру кнопки активного плеєра

            if (state.data === 0) { //! якщо відео вже закінчилось
                if (blockedElem.querySelector('.play__circle').classList.contains('closed')) {//! якщо наступний елемент буде заблоковано
                    blockedElem.querySelector('.play__circle').classList.remove('closed');
                    blockedElem.querySelector('svg').remove();
                    blockedElem.querySelector('.play__circle').appendChild(playBtn); //! вставляємо кнопку активного плеєра
                    blockedElem.querySelector('.play__text').textContent = 'play video';
                    blockedElem.querySelector('.play__text').classList.remove('attention');
                    blockedElem.style.opacity = 1;
                    blockedElem.style.filter = 'none';

                    blockedElem.setAttribute('data-disabled', 'false');
                }
            }
        } catch(e){}
    }

    init() {
        if (this.btns.length > 0) {
            const tag = document.createElement('script');

            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            this.bindTriggers();
            this.bindCloseBtn();
        }
    }
}