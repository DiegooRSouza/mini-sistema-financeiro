const Modal = {
    open() {
        document.querySelector('.modal-overlay')
                .classList.add('active')
    },

    close() {
        document.querySelector('.modal-overlay')
                .classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transacoes")) || []
    },

    set(transacoes) {
        localStorage.setItem("dev.finances:transacoes", JSON.stringify(transacoes))
    }
}

const Transacao = {
    all: Storage.get(),

    add(transacao) {
        Transacao.all.push(transacao)
        App.reload()
    },

    remove(indice) {
        Transacao.all.splice(indice, 1)

        App.reload()
    },

    ganhos() {
        let ganho = 0
        Transacao.all.forEach(transacao => {
            if( transacao.valor > 0 ) {
                ganho += transacao.valor
            }
        })
        return ganho
    },

    desepesas() {
        let despesa = 0
        Transacao.all.forEach(transacao => {
            if( transacao.valor < 0 ) {
                despesa += transacao.valor
            }
        })
        return despesa
    }, 

    total() {
        return Transacao.ganhos() + Transacao.desepesas()
    }
}

const DOM = {
    containerTransacoes: document.querySelector('#tabela-dados tbody'),

    addTransacao(transacao, indice) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransacao(transacao, indice)
        tr.dataset.indice = indice
        DOM.containerTransacoes.appendChild(tr)
    },

    innerHTMLTransacao(transacao, indice) {
        const CSSclasse = transacao.valor > 0 ? "ganho" : "despesa"
        const valor = Uteis.formatoMoeda(transacao.valor)
        const html = `
            <td class="descricao">${transacao.descricao}</td>
            <td class="${CSSclasse}">${valor}</td>
            <td class="data">${transacao.data}</td>
            <td>
                <img onclick="Transacao.remove(${indice})" src="imgs/minus.svg" alt="remover transação">
            </td>
        `
        return html
    },

    atualizaBalanco() {
        document.getElementById('telaEntrada')
                .innerHTML = Uteis.formatoMoeda(Transacao.ganhos())
        document.getElementById('telaSaida')
                .innerHTML = Uteis.formatoMoeda(Transacao.desepesas())
        document.getElementById('telaTotal')
                .innerHTML = Uteis.formatoMoeda(Transacao.total())
    },

    limparTransacoes() {
        DOM.containerTransacoes.innerHTML = ""
    }
}

const Uteis = {
    formatoValor(valor) {
        valor = valor * 100
        return Math.round(valor) 
    },

    formatarData(data) {
        const dataBr = data.split("-")
        return `${dataBr[2]}/${dataBr[1]}/${dataBr[0]}`
    },

    formatoMoeda(valor) {
        const sinal = Number(valor) < 0 ? "-" : ""
        valor = String(valor).replace(/\D/g, "")
        valor = Number(valor) / 100
        valor = valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return sinal + valor
    }
}

const Form = {
    descricao: document.querySelector('input#descricao'),
    valor: document.querySelector('input#valor'),
    data: document.querySelector('input#data'),

    getValues() {
        return {
            descricao: Form.descricao.value,
            valor: Form.valor.value,
            data: Form.data.value
        }
    },

    validarCampos() {
        const { descricao, valor, data } = Form.getValues()

        if( descricao.trim() === "" || valor.trim() === "" || data.trim() === "" ) {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatarValores() {
        let { descricao, valor, data } = Form.getValues()
        valor = Uteis.formatoValor(valor)
        data = Uteis.formatarData(data)
        
        return {
            descricao,
            valor,
            data
        }
    },

    limparCampos() {
        Form.descricao.value = ""
        Form.valor.value = ""
        Form.data.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validarCampos()
            const transacao = Form.formatarValores()
            Transacao.add(transacao)
            Form.limparCampos()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }

        
    }
}

const App = {
    init() {
        Transacao.all.forEach((transacao, indice) => {
            DOM.addTransacao(transacao, indice)
        })

        DOM.atualizaBalanco()
        Storage.set(Transacao.all)
    },

    reload() {
        DOM.limparTransacoes()
        App.init()
    },
}

App.init()