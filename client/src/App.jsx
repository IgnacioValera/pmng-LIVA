import { useEffect, useState } from 'react'

export default function App() {
  const [name, setName] = useState('')
  const [people, setPeople] = useState([])
  const [apiUrl, setApiUrl] = useState('')

  useEffect(() => {
    let active = true

    fetch('config.json')
      .then((response) => response.json())
      .then((config) => {
        if (!active) {
          return
        }
        setApiUrl(config.apiUrl.replace('ip_publica', window.location.hostname))
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!apiUrl) {
      return
    }
    load(apiUrl)
  }, [apiUrl])

  function load(url) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => setPeople(data))
  }

  function send() {
    const trimmed = name.trim()
    if (!trimmed || !apiUrl) {
      return
    }
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    }).then(() => {
      setName('')
      load(apiUrl)
    })
  }

  return (
    <>
      <h1>Personas</h1>
      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <button type="button" onClick={send}>enviar</button>
      <ul>
        {people.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </>
  )
}
