import { Stage, Graphics } from '@inlet/react-pixi';
import { useCallback, useEffect, useState } from 'react';

const parse = (data, side) =>
  JSON.parse(data)[side].map(([p, a]) => [+p, +a])

const App = () => {
  const [width, setWIdth] = useState(800)
  const [height, setHeight] = useState(500)

  const [book, setBook] = useState({ bids: [], asks: [], maxAmount: 0 })

  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth20@100ms');

    ws.onppen = function open() {
      console.log('connected');
    }

    ws.onmessage = function (event) {
      const bids = parse(event.data, "bids")
      const asks = parse(event.data, "asks")


      setBook({
        bids,
        asks,
        maxAmount: Math.max(...(bids.concat(asks).map(([_, a]) => a)))
      })
    }

    return ws.close
  }, [])

  useEffect(() => {
    console.log(book)
  }, [book])

  const draw = useCallback(g => {
    g.clear()

    const books = book.bids.concat(book.asks.reverse())

    books.forEach(([_price, amount], i) => {
      const h = 10
      if (i < book.bids.length) {
        g.beginFill(0xa6b401, 1)
      } else {
        g.beginFill(0xd50102, 1)
      }
      g.drawRect(0, i * h, 140 * (amount / book.maxAmount), h)
    })

    g.endFill()
  }, [book])


  return (
    <Stage width={width} height={height}>
      <Graphics draw={draw} />
    </Stage>
  )
};

export default App;