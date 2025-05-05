import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://furia-backend-9g7k.onrender.com');

function App() {
  const [mensagem, setMensagem] = useState('');
  const [mensagens, setMensagens] = useState<string[]>([]);
  const [placar, setPlacar] = useState<{ time1: string; time2: string; score1: number; score2: number } | null>(null);
  const [proximaPartida, setProximaPartida] = useState<any>(null);


  useEffect(() => {

    fetch("https://furia-backend-9g7k.onrender.com/api/match/furia")
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setProximaPartida(data[0]);
        }
      });

    const partidaFake = {
      opponents: [
        { opponent: { name: "FURIA" } },
        { opponent: { name: "G2 Esports" } }
      ],
      begin_at: new Date().toISOString(),
      status: "not_started"
    };

    console.log("Usando partida fake para testes");
    setProximaPartida(partidaFake);

    /*fetch("http://localhost:3001/api/match/furia")
      .then(res => res.json())
      .then(data => {
        console.log("Próximas partidas da FURIA: ", data);
      });*/

    socket.on("placarAtualizado", (novoPlacar) => {
      setPlacar(novoPlacar);
    })

    socket.on("receive_message", (msg: string) => {
      setMensagens((prev) => [...prev, msg]);
    });

    socket.on("match_update", (dadosPlacar) => {
      setPlacar(dadosPlacar);
    });

    return () => {
      socket.off("receive_message");
      socket.off("match_update");
    };
  }, []);


  return (
    <div className="container">
      <img src="/furia-logo.png" alt="Logo Furia" className="logo" />
      <h1 className="slogan">FURIA CHAT</h1>

      <div className="chat-box">
        <div className="mensagens">
          {mensagens.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>
        <input
          type="text"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Digite sua mensagem."
        />
        <button onClick={() => {
          socket.emit("send_message", mensagem);
          setMensagem('');
        }}>Enviar</button>
      </div>

      <div className="placar-box">
        <h2>Placar da Partida</h2>
        {placar ? (
          <p>{placar.time1} {placar.score1} x {placar.time2} {placar.score2}</p>
        ) : (
          <p>Nenhum placar carregado</p>
        )}
        <button onClick={() => socket.emit("request_match_update")}>Atualizar Placar</button>
      </div>

      {proximaPartida && proximaPartida.opponents && proximaPartida.opponents.length > 1 && (
        <div className="partida-box">
          <h2>Próxima Partida</h2>
          <p>
            <strong>FURIA</strong> vs{" "}
            <strong>
              {
                proximaPartida.opponents.find((o: any) =>
                  !o.opponent.name.includes("FURIA")
                )?.opponent.name ?? "Adversário indefinido"
              }
            </strong>
          </p>
          <p>{new Date(proximaPartida.begin_at).toLocaleString()}</p>
          <p>Status: {proximaPartida.status}</p>
        </div>
      )}

    </div>
  );
}

export default App;