import {
    MessageTypes
} from '../../../common/constants'
/**
 * This is injected into each active tab by the Linewize
 * extension to either display, or remove, a floating chat bubble
 * that can be used to activate the Classwize Chat Window when clicked.
 */
export default class ChatBubble {
    public static async init() {
        const status = await ChatBubble.sendRuntimeMessage({type: MessageTypes.ChatBubbleStatus})
        
        if (status) {
            this.createChatBubble()
        } else {
            this.removeChatBubble()
        }
    }

    public static async sendRuntimeMessage(request: unknown): Promise<any> {
        return new Promise<unknown>((resolve) => {
            chrome.runtime.sendMessage(request, (response) => {
                resolve(response)
            })
        })
    }

    private static createChatBubble() {
        let chatIcon = document.getElementById('bubbleId')

        if (!chatIcon) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
            let isDragging = false
            chatIcon = document.createElement('div')
            chatIcon.id = 'bubbleId'
            chatIcon.style.height = '60px'
            chatIcon.style.width = '60px'
            chatIcon.style.position = 'fixed'
            chatIcon.style.right = String(0)
            chatIcon.style.bottom = String(0)

            chatIcon.style.zIndex = String(Number.MAX_SAFE_INTEGER - 1)
            const chatImage = document.createElement('img')
            chatImage.style.width = '60px'
            chatImage.style.height = '60px'
            chatImage.style.borderRadius = '50%'
            chatImage.style.boxShadow = '0 10px 20px 5px rgba(0, 0, 0, 0.1)'
            chatImage.src = chrome.runtime.getURL('/chat/assets/imgs/bubble.svg')
            chatIcon.appendChild(chatImage)

            chatIcon.addEventListener('click', () => {
                // If we are not dragging, show chat. If we are dragging, set the flag to false
                if (!isDragging) {
                    ChatBubble.sendRuntimeMessage({ type: 'SHOW_CHAT_UI' })
                } else {
                    isDragging = false
                }
            })

            const dragElement = (element: HTMLElement) => {
                const dragMouseDown = (e: MouseEvent) => {
                    e = e || window.event
                    e.preventDefault()
                    // Get the mouse cursor position at startup:
                    pos3 = e.clientX
                    pos4 = e.clientY
                    document.onmouseup = closeDragElement
                    // Call a function whenever the cursor moves:
                    document.onmousemove = elementDrag
                }

                (chatIcon as HTMLElement).onmousedown = dragMouseDown


                const elementDrag = (e: MouseEvent) => {
                    e = e || window.event
                    e.preventDefault()
                    // Calculate the new cursor position:
                    pos1 = pos3 - e.clientX
                    pos2 = pos4 - e.clientY
                    pos3 = e.clientX
                    pos4 = e.clientY

                    // Check the new positions to ensure user can't drag outside window
                    const newTop = element.offsetTop - pos2
                    const newLeft = element.offsetLeft - pos1
                    if (newTop < 0 || (newTop + 60) > window.innerHeight || newLeft < 0 || (newLeft + 60) > window.innerWidth) {
                        return
                    }

                    // Set the element's new position:
                    element.style.top = newTop + 'px'
                    element.style.left = newLeft + 'px'
                    // Set the flag to true
                    isDragging = true
                }

                function closeDragElement() {
                    document.onmouseup = null
                    document.onmousemove = null
                    ChatBubble.sendRuntimeMessage({ type: 'UPDATE_CHAT_BUBBLE_POSITION',
                        imageLeft: (chatIcon as HTMLElement).offsetLeft - pos2 ,
                        imageTop: (chatIcon as HTMLElement).offsetTop - pos2 })
                }
            }

            dragElement(chatIcon)
            document.body.appendChild(chatIcon)
        } else {
            let notificationBubble = document.getElementById('msgCountId')

            if (!notificationBubble) {
                notificationBubble = document.createElement('div')
                notificationBubble.id = 'msgCountId'
                notificationBubble.style.height = '24px'
                notificationBubble.style.width = '24px'
                notificationBubble.style.borderRadius = '50%'
                notificationBubble.style.backgroundColor = '#DF2935'
                notificationBubble.style.position = 'absolute'
                notificationBubble.style.zIndex = String(Number.MAX_SAFE_INTEGER)
                notificationBubble.style.top = '-6.67%'
                notificationBubble.style.left = '66.67%'
                notificationBubble.style.alignItems = 'center'
                notificationBubble.style.justifyContent = 'center'
                notificationBubble.style.display = 'flex'
                notificationBubble.style.color = 'white'
                notificationBubble.style.fontSize = '12px'
                notificationBubble.style.fontWeight = 'bold'
                chatIcon.appendChild(notificationBubble)
            }

            // Set the text to the message count
            if (window.lwChatMsgCount) {
                notificationBubble.innerText = (window.lwChatMsgCount > 9) ? '9+' : window.lwChatMsgCount.toString()
                notificationBubble.style.visibility = 'visible'
            } else {
                notificationBubble.style.visibility = 'hidden'
            }

            // Set position
            if (window.lwChatImageLeft) {
                chatIcon.style.left = window.lwChatImageLeft + 'px'
            }

            if (window.lwChatImageTop) {
                chatIcon.style.top = window.lwChatImageTop + 'px'
            }
        }
    }

    private static removeChatBubble() {
        // Close chat window
        ChatBubble.sendRuntimeMessage({ type: 'CLOSE_CHAT_UI' })

        const chatIcon = document.getElementById('bubbleId')

        if (!chatIcon) {
            return
        }

        return (chatIcon.parentNode as ParentNode).removeChild(chatIcon)
    }

}

ChatBubble.init()
