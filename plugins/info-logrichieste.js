global.richiesteAntiSpam = global.richiesteAntiSpam || {}

const pluginName = 'info-logrichieste.js'

const attachListener = () => {
    const conn = global.conn
    if (!conn?.ev?.on) return false

    conn.ev.on('group-participants.update', async (update) => {
        try {
            const { id, action, participants, actor, author } = update
            const chatId = (typeof conn.decodeJid === 'function') ? conn.decodeJid(id) : id

            let plugin = global.plugins?.[pluginName]
            if (!plugin && global.plugins) {
                const match = Object.keys(global.plugins).find(name => name.replace(/^.*[\/]/, '').replace(/\.js$/, '').toLowerCase() === 'info-logrichieste')
                if (match) plugin = global.plugins[match]
            }
            if (plugin?.disabled) return

            if (global.db && !global.db.data && typeof global.loadDatabase === 'function') {
                await global.loadDatabase()
            }

            const chatSettings = global.db?.data?.chats?.[chatId] || {}
            if (chatSettings.logrichieste === false) return

            if (action === 'add') {
                const admin = actor || author
                if (!admin) return

                const botJid = (conn.user && (conn.user.jid || conn.user.id)) ? ((typeof conn.decodeJid === 'function') ? conn.decodeJid(conn.user.jid || conn.user.id) : (conn.user.jid || conn.user.id)) : ''
                const addedJids = Array.isArray(participants) ? participants.filter(p => p && p !== admin && p !== botJid) : []
                if (addedJids.length === 0) return

                const chiaveUnica = `${chatId}_${admin}`
                if (!global.richiesteAntiSpam[chiaveUnica]) {
                    global.richiesteAntiSpam[chiaveUnica] = { jids: new Set(), timer: null }
                } else if (global.richiesteAntiSpam[chiaveUnica].timer) {
                    clearTimeout(global.richiesteAntiSpam[chiaveUnica].timer)
                }

                for (const j of addedJids) global.richiesteAntiSpam[chiaveUnica].jids.add(j)
                if (global.richiesteAntiSpam[chiaveUnica].jids.size === 0) return

                global.richiesteAntiSpam[chiaveUnica].timer = setTimeout(async () => {
                    try {
                        const adminNumero = admin.split('@')[0]
                        const totaleAccettati = global.richiesteAntiSpam[chiaveUnica].jids.size || 0
                        const testoMessaggio = totaleAccettati === 1
                            ? `*📢 Richiesta accettata dall’admin @${adminNumero}*\n> *Se non vuoi questa funzione ti basta fare ''.disabilita logrichieste''*`
                            : `*📢 ${totaleAccettati} richieste accettate dall’admin @${adminNumero}*\n> *Se non vuoi questa funzione ti basta fare ''.disabilita logrichieste''* `

                        await conn.sendMessage(chatId, {
                            text: testoMessaggio,
                            contextInfo: { mentionedJid: [admin] },
                            mentions: [admin]
                        })
                    } catch (e) {
                    }

                    delete global.richiesteAntiSpam[chiaveUnica]
                }, 10000)
            }
        } catch (e) {
        }
    })

    return true
}

const initPlugin = () => {
    if (global.richiesteLoggerInitialized) return
    global.richiesteLoggerInitialized = true

    if (!attachListener()) {
        const interval = setInterval(() => {
            if (attachListener()) clearInterval(interval)
        }, 1000)
    }
}

initPlugin()

export const disabled = false
