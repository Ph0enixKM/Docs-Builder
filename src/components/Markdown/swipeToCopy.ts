const MAX = 50
const THRESHOLD = 10

function copyToClipboard(text: string) {
    try {
        navigator.clipboard.writeText(text)
    } catch {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.left = '-999999px'
        textarea.style.top = '-999999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
    }
}

export default function setSwipeToCopy(blocks: HTMLDivElement[]) {
    for (const block of blocks) {
        const sideAction = block.children[0] as HTMLDivElement
        let position = 0
        let trigger = false

        const moveBack = () => {
            sideAction.style.opacity = '0'
            block.style.transitionDuration = '200ms'
            block.style.transform = 'translate(0, 0)'
            setTimeout(() => {
                block.style.transitionDuration = 'unset'
            }, 100)
        }

        block.addEventListener('pointerdown', (e) => {
            // Check if user is scrolling code block or is trying to swipe
            const code = block.children[1] as HTMLDivElement
            if (code.tagName === 'PRE') {
                const codeBlock = code.children[0] as HTMLDivElement
                if (codeBlock.scrollLeft > 0) return
            }
            trigger = true
            position = e.x
        })

        addEventListener('pointermove', (e) => {
            if (!trigger) return
            const delta = e.x - position
            if (delta < 0 || delta > MAX) return
            block.style.transform = `translate(${e.x - position}px, 0)`
            sideAction.style.opacity = `${delta / MAX}`
        })

        addEventListener('scroll', () => {
            if (!trigger) return
            trigger = false
            moveBack()
        })

        addEventListener('pointerup', (e) => {
            if (!trigger) return
            trigger = false
            if (e.x - position < MAX - THRESHOLD) return moveBack()
            const id = sideAction.getAttribute('id')
            // This is a workaround for a bug in Safari where the clipboard API doesn't work without a user gesture on iOS
            if (id) {
                copyToClipboard(window.location.href.split('#')[0] + `#${id}`)
            } else {
                copyToClipboard(block.innerText)
            }
            sideAction.click()
            setTimeout(() => {
                moveBack()
            }, 1000)
        })
    }
}
