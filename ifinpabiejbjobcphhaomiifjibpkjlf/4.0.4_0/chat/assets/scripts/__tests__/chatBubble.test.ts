import ChatBubble from '../chatBubble'
import { MessageTypes } from '../../../../common/constants'

// Constants
const CHAT_BUBBLE_ID = 'bubbleId'
const NOTIFICATION_BUBBLE_ID = 'msgCountId'
const BUBBLE_SIZE = 60
const NOTIFICATION_SIZE = 24
const MAX_DISPLAY_COUNT = 9
const BUBBLE_IMAGE_PATH = '/chat/assets/imgs/bubble.svg'
const NOTIFICATION_COLOR_RGB = 'rgb(223, 41, 53)'

// Mock chrome.runtime
const mockSendMessage = jest.fn()
const mockGetURL = jest.fn()

beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = ''
    
    // Reset mocks
    jest.clearAllMocks()
    
    // Mock chrome.runtime
    ;(global.chrome.runtime.sendMessage as jest.Mock) = mockSendMessage
    ;(global.chrome.runtime.getURL as jest.Mock) = mockGetURL.mockReturnValue(BUBBLE_IMAGE_PATH)
    
    // Reset window properties (set to 0 since code checks for truthy values)
    window.lwChatMsgCount = 0
    window.lwChatImageLeft = 0
    window.lwChatImageTop = 0
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800,
    })
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
    })
})

describe('ChatBubble', () => {
    describe('init', () => {
        it('should create chat bubble when status is true', async () => {
            mockSendMessage.mockImplementation((request, callback) => {
                callback(true)
            })
            
            await ChatBubble.init()
            
            const chatIcon = document.getElementById(CHAT_BUBBLE_ID)
            expect(chatIcon).not.toBeNull()
            expect(mockSendMessage).toHaveBeenCalledWith(
                { type: MessageTypes.ChatBubbleStatus },
                expect.any(Function)
            )
        })
        
        it('should remove chat bubble when status is false', async () => {
            // Setup: Create an existing bubble
            const existingBubble = document.createElement('div')
            existingBubble.id = CHAT_BUBBLE_ID
            document.body.appendChild(existingBubble)
            
            mockSendMessage.mockImplementation((request, callback) => {
                if (
                    request &&
                    typeof request === 'object' &&
                    'type' in request &&
                    (request as { type: string }).type === MessageTypes.ChatBubbleStatus
                ) {
                    callback(false)
                } else {
                    callback(undefined)
                }
            })
            
            await ChatBubble.init()
            
            const chatIcon = document.getElementById(CHAT_BUBBLE_ID)
            expect(chatIcon).toBeNull()
            expect(mockSendMessage).toHaveBeenCalledWith(
                { type: 'CLOSE_CHAT_UI' },
                expect.any(Function)
            )
        })
    })
    
    describe('sendRuntimeMessage', () => {
        it('should send message via chrome.runtime.sendMessage and return response', async () => {
            const mockResponse = { data: 'test' }
            mockSendMessage.mockImplementation((request, callback) => {
                callback(mockResponse)
            })
            
            const result = await ChatBubble.sendRuntimeMessage({ type: 'TEST' })
            
            expect(result).toEqual(mockResponse)
            expect(mockSendMessage).toHaveBeenCalledWith(
                { type: 'TEST' },
                expect.any(Function)
            )
        })
        
        it('should resolve with undefined when callback receives undefined', async () => {
            mockSendMessage.mockImplementation((request, callback) => {
                callback(undefined)
            })
            
            const result = await ChatBubble.sendRuntimeMessage({ type: 'TEST' })
            
            expect(result).toBeUndefined()
        })
    })
    
    describe('createChatBubble', () => {
        const setupChatBubble = async (): Promise<HTMLElement> => {
            mockSendMessage.mockImplementation((request, callback) => {
                callback(true)
            })
            await ChatBubble.init()
            const chatIcon = document.getElementById(CHAT_BUBBLE_ID)
            if (!chatIcon) {
                throw new Error('Chat bubble was not created')
            }
            return chatIcon as HTMLElement
        }
        
        describe('initial bubble creation', () => {
            it('should create chat bubble element with correct styles', async () => {
                await setupChatBubble()
                
                const chatIcon = document.getElementById(CHAT_BUBBLE_ID)
                expect(chatIcon).not.toBeNull()
                expect(chatIcon?.style.height).toBe(`${BUBBLE_SIZE}px`)
                expect(chatIcon?.style.width).toBe(`${BUBBLE_SIZE}px`)
                expect(chatIcon?.style.position).toBe('fixed')
                expect(chatIcon?.style.right).toBe('0px')
                expect(chatIcon?.style.bottom).toBe('0px')
                expect(chatIcon?.style.zIndex).toBe(String(Number.MAX_SAFE_INTEGER - 1))
            })
            
            it('should create chat image with correct properties', async () => {
                await setupChatBubble()
                
                const chatIcon = document.getElementById(CHAT_BUBBLE_ID)
                const chatImage = chatIcon?.querySelector('img')
                
                expect(chatImage).not.toBeNull()
                expect(chatImage?.style.width).toBe(`${BUBBLE_SIZE}px`)
                expect(chatImage?.style.height).toBe(`${BUBBLE_SIZE}px`)
                expect(chatImage?.style.borderRadius).toBe('50%')
                expect(chatImage?.style.boxShadow).toBe('0 10px 20px 5px rgba(0, 0, 0, 0.1)')
                expect(chatImage?.src).toContain(BUBBLE_IMAGE_PATH)
                expect(mockGetURL).toHaveBeenCalledWith(BUBBLE_IMAGE_PATH)
            })
            
            it('should append chat bubble to document body', async () => {
                await setupChatBubble()
                
                const chatIcon = document.getElementById(CHAT_BUBBLE_ID)
                expect(chatIcon?.parentNode).toBe(document.body)
            })
        })
        
        describe('click handler', () => {
            it('should send SHOW_CHAT_UI message when clicked without dragging', async () => {
                const chatIcon = await setupChatBubble()
                
                const clickEvent = new MouseEvent('click', { bubbles: true })
                chatIcon.dispatchEvent(clickEvent)
                
                // Wait for async sendRuntimeMessage call
                await new Promise(resolve => setTimeout(resolve, 0))
                
                expect(mockSendMessage).toHaveBeenCalledWith(
                    { type: 'SHOW_CHAT_UI' },
                    expect.any(Function)
                )
            })
            
            it('should not send SHOW_CHAT_UI message when clicked after dragging', async () => {
                const chatIcon = await setupChatBubble()
                
                // Setup offset properties for drag calculation
                Object.defineProperty(chatIcon, 'offsetLeft', {
                    get: () => parseInt(chatIcon.style.left) || 0,
                    configurable: true,
                })
                Object.defineProperty(chatIcon, 'offsetTop', {
                    get: () => parseInt(chatIcon.style.top) || 0,
                    configurable: true,
                })
                
                // Simulate drag sequence
                const mouseDownEvent = new MouseEvent('mousedown', {
                    bubbles: true,
                    clientX: 100,
                    clientY: 100,
                })
                chatIcon.dispatchEvent(mouseDownEvent)
                
                const mouseMoveEvent = new MouseEvent('mousemove', {
                    bubbles: true,
                    clientX: 150,
                    clientY: 150,
                })
                document.dispatchEvent(mouseMoveEvent)
                
                // Clear previous calls
                mockSendMessage.mockClear()
                
                // Click after drag
                const clickEvent = new MouseEvent('click', { bubbles: true })
                chatIcon.dispatchEvent(clickEvent)
                
                // Wait for any async operations
                await new Promise(resolve => setTimeout(resolve, 0))
                
                expect(mockSendMessage).not.toHaveBeenCalledWith(
                    { type: 'SHOW_CHAT_UI' },
                    expect.any(Function)
                )
            })
        })
        
        describe('notification bubble', () => {
            const setupNotificationBubble = async (): Promise<{ chatIcon: HTMLElement; notificationBubble: HTMLElement }> => {
                await setupChatBubble()
                // Second init creates notification bubble
                await ChatBubble.init()
                
                const chatIcon = document.getElementById(CHAT_BUBBLE_ID) as HTMLElement
                const notificationBubble = document.getElementById(NOTIFICATION_BUBBLE_ID)
                
                if (!notificationBubble) {
                    throw new Error('Notification bubble was not created')
                }
                
                return { chatIcon, notificationBubble: notificationBubble as HTMLElement }
            }
            
            it('should create notification bubble when chat icon already exists', async () => {
                const { notificationBubble } = await setupNotificationBubble()
                
                expect(notificationBubble.style.height).toBe(`${NOTIFICATION_SIZE}px`)
                expect(notificationBubble.style.width).toBe(`${NOTIFICATION_SIZE}px`)
                expect(notificationBubble.style.borderRadius).toBe('50%')
                expect(notificationBubble.style.backgroundColor).toBe(NOTIFICATION_COLOR_RGB)
                expect(notificationBubble.style.position).toBe('absolute')
                expect(notificationBubble.style.zIndex).toBe(String(Number.MAX_SAFE_INTEGER))
            })
            
            it('should display message count when lwChatMsgCount is set', async () => {
                const messageCount = 5
                window.lwChatMsgCount = messageCount
                
                const { notificationBubble } = await setupNotificationBubble()
                
                expect(notificationBubble.innerText).toBe(messageCount.toString())
                expect(notificationBubble.style.visibility).toBe('visible')
            })
            
            it('should display "9+" when message count exceeds maximum display count', async () => {
                window.lwChatMsgCount = MAX_DISPLAY_COUNT + 1
                
                const { notificationBubble } = await setupNotificationBubble()
                
                expect(notificationBubble.innerText).toBe('9+')
            })
            
            it('should hide notification bubble when lwChatMsgCount is not set', async () => {
                const { notificationBubble } = await setupNotificationBubble()
                
                expect(notificationBubble.style.visibility).toBe('hidden')
            })
            
            it('should not create duplicate notification bubbles on subsequent calls', async () => {
                await setupChatBubble()
                await ChatBubble.init()
                await ChatBubble.init()
                
                const notificationBubbles = document.querySelectorAll(`#${NOTIFICATION_BUBBLE_ID}`)
                expect(notificationBubbles.length).toBe(1)
            })
        })
        
        describe('position restoration', () => {
            it('should restore chat icon position from window.lwChatImageLeft', async () => {
                const expectedLeft = 200
                window.lwChatImageLeft = expectedLeft
                
                await setupChatBubble()
                await ChatBubble.init()
                
                const chatIcon = document.getElementById(CHAT_BUBBLE_ID)
                expect(chatIcon?.style.left).toBe(`${expectedLeft}px`)
            })
            
            it('should restore chat icon position from window.lwChatImageTop', async () => {
                const expectedTop = 300
                window.lwChatImageTop = expectedTop
                
                await setupChatBubble()
                await ChatBubble.init()
                
                const chatIcon = document.getElementById(CHAT_BUBBLE_ID)
                expect(chatIcon?.style.top).toBe(`${expectedTop}px`)
            })
            
            it('should restore both left and top positions when both are set', async () => {
                const expectedLeft = 150
                const expectedTop = 250
                window.lwChatImageLeft = expectedLeft
                window.lwChatImageTop = expectedTop
                
                await setupChatBubble()
                await ChatBubble.init()
                
                const chatIcon = document.getElementById(CHAT_BUBBLE_ID)
                expect(chatIcon?.style.left).toBe(`${expectedLeft}px`)
                expect(chatIcon?.style.top).toBe(`${expectedTop}px`)
            })
        })
        
        describe('drag functionality', () => {
            const setupDraggableBubble = async (initialLeft: number, initialTop: number): Promise<HTMLElement> => {
                const chatIcon = await setupChatBubble()
                chatIcon.style.left = `${initialLeft}px`
                chatIcon.style.top = `${initialTop}px`
                
                Object.defineProperty(chatIcon, 'offsetLeft', {
                    get: () => parseInt(chatIcon.style.left) || initialLeft,
                    configurable: true,
                })
                Object.defineProperty(chatIcon, 'offsetTop', {
                    get: () => parseInt(chatIcon.style.top) || initialTop,
                    configurable: true,
                })
                
                return chatIcon
            }
            
            it('should update bubble position when dragged within window boundaries', async () => {
                const initialLeft = 100
                const initialTop = 100
                const chatIcon = await setupDraggableBubble(initialLeft, initialTop)
                
                // Start drag
                const mouseDownEvent = new MouseEvent('mousedown', {
                    bubbles: true,
                    clientX: initialLeft,
                    clientY: initialTop,
                })
                chatIcon.dispatchEvent(mouseDownEvent)
                
                // Drag to new position
                const mouseMoveEvent = new MouseEvent('mousemove', {
                    bubbles: true,
                    clientX: initialLeft + 50,
                    clientY: initialTop + 50,
                })
                document.dispatchEvent(mouseMoveEvent)
                
                // Position should have changed
                const newLeft = parseInt(chatIcon.style.left)
                const newTop = parseInt(chatIcon.style.top)
                expect(newLeft).not.toBe(initialLeft)
                expect(newTop).not.toBe(initialTop)
            })
            
            it('should prevent dragging outside window boundaries', async () => {
                const initialLeft = 0
                const initialTop = 0
                const chatIcon = await setupDraggableBubble(initialLeft, initialTop)
                
                // Start drag
                const mouseDownEvent = new MouseEvent('mousedown', {
                    bubbles: true,
                    clientX: 0,
                    clientY: 0,
                })
                chatIcon.dispatchEvent(mouseDownEvent)
                
                // Try to drag to negative position
                const mouseMoveEvent = new MouseEvent('mousemove', {
                    bubbles: true,
                    clientX: -100,
                    clientY: -100,
                })
                document.dispatchEvent(mouseMoveEvent)
                
                // Position should remain unchanged
                expect(chatIcon.style.left).toBe(`${initialLeft}px`)
                expect(chatIcon.style.top).toBe(`${initialTop}px`)
            })
            
            it('should prevent dragging beyond right edge of window', async () => {
                const initialLeft = window.innerWidth - BUBBLE_SIZE - 10
                const initialTop = 100
                const chatIcon = await setupDraggableBubble(initialLeft, initialTop)
                
                // Start drag
                const mouseDownEvent = new MouseEvent('mousedown', {
                    bubbles: true,
                    clientX: initialLeft,
                    clientY: initialTop,
                })
                chatIcon.dispatchEvent(mouseDownEvent)
                
                // Try to drag beyond right edge
                const mouseMoveEvent = new MouseEvent('mousemove', {
                    bubbles: true,
                    clientX: window.innerWidth + 100,
                    clientY: initialTop,
                })
                document.dispatchEvent(mouseMoveEvent)
                
                // Position should not exceed window boundary
                const finalLeft = parseInt(chatIcon.style.left)
                expect(finalLeft + BUBBLE_SIZE).toBeLessThanOrEqual(window.innerWidth)
            })
            
            it('should send UPDATE_CHAT_BUBBLE_POSITION message on mouseup after drag', async () => {
                const initialLeft = 100
                const initialTop = 100
                const chatIcon = await setupDraggableBubble(initialLeft, initialTop)
                
                // Start drag
                const mouseDownEvent = new MouseEvent('mousedown', {
                    bubbles: true,
                    clientX: initialLeft,
                    clientY: initialTop,
                })
                chatIcon.dispatchEvent(mouseDownEvent)
                
                // Move during drag
                const mouseMoveEvent = new MouseEvent('mousemove', {
                    bubbles: true,
                    clientX: initialLeft + 10,
                    clientY: initialTop + 10,
                })
                document.dispatchEvent(mouseMoveEvent)
                
                // End drag
                mockSendMessage.mockClear()
                const mouseUpEvent = new MouseEvent('mouseup', {
                    bubbles: true,
                })
                document.dispatchEvent(mouseUpEvent)
                
                // Wait for async operations
                await new Promise(resolve => setTimeout(resolve, 0))
                
                expect(mockSendMessage).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'UPDATE_CHAT_BUBBLE_POSITION',
                    }),
                    expect.any(Function)
                )
            })
        })
    })
    
    describe('removeChatBubble', () => {
        it('should send CLOSE_CHAT_UI message', async () => {
            mockSendMessage.mockImplementation((request, callback) => {
                callback(false)
            })
            
            await ChatBubble.init()
            
            expect(mockSendMessage).toHaveBeenCalledWith(
                { type: 'CLOSE_CHAT_UI' },
                expect.any(Function)
            )
        })
        
        it('should remove chat bubble element from DOM when it exists', async () => {
            // Setup: Create bubble first
            mockSendMessage.mockImplementation((request, callback) => {
                callback(true)
            })
            await ChatBubble.init()
            expect(document.getElementById(CHAT_BUBBLE_ID)).not.toBeNull()
            
            // Remove bubble
            mockSendMessage.mockImplementation((request, callback) => {
                callback(false)
            })
            await ChatBubble.init()
            
            expect(document.getElementById(CHAT_BUBBLE_ID)).toBeNull()
        })
        
        it('should handle removal gracefully when chat bubble does not exist', async () => {
            mockSendMessage.mockImplementation((request, callback) => {
                callback(false)
            })
            
            await ChatBubble.init()
            
            expect(document.getElementById(CHAT_BUBBLE_ID)).toBeNull()
            expect(mockSendMessage).toHaveBeenCalledWith(
                { type: 'CLOSE_CHAT_UI' },
                expect.any(Function)
            )
        })
    })
})
