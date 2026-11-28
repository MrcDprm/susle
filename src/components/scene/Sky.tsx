import { Snow } from './Snow'

// Yıldızların yerleri sabit; her yüklemede aynı gökyüzü.
const STARS: [number, number, number][] = [
  [6, 8, 0.5], [14, 22, 0.35], [21, 6, 0.4], [29, 15, 0.6], [35, 30, 0.3], [42, 9, 0.45], [50, 20, 0.35],
  [57, 4, 0.5], [63, 27, 0.3], [70, 12, 0.55], [77, 24, 0.35], [84, 7, 0.4], [91, 18, 0.5], [96, 32, 0.3],
  [10, 36, 0.3], [25, 40, 0.25], [46, 38, 0.3], [67, 42, 0.25], [88, 40, 0.3], [3, 26, 0.35], [38, 2, 0.3],
  [74, 34, 0.3], [53, 31, 0.25], [17, 13, 0.3], [81, 14, 0.3],
]

// Havai fişekler: yerleri, renkleri ve patlama zamanları CSS'te, f0-f4 sınıflarında.
const FIREWORKS = [0, 1, 2, 3, 4]

// Gökyüzünün bütün katmanları. Hangisinin görüneceğini data-sky ya da sky-N sınıfı seçer:
// 0 gece, 1 kuzey ışıkları, 2 alacakaranlık, 3 Samanyolu, 4 kar bulutları, 5 havai fişek.
export function SkyLayers() {
  return (
    <>
      <div className="twilight" />
      <div className="overcast" />
      <svg className="stars" viewBox="0 0 100 50" preserveAspectRatio="xMidYMin slice">
        {STARS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} className={`star s${i % 5}`} />
        ))}
      </svg>
      <div className="milky" />
      <div className="aurora">
        <span />
        <span />
        <span />
      </div>
      <div className="moon" />
      <div className="clouds">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="fireworks">
        {FIREWORKS.map((i) => (
          <span key={i} className={`fw f${i}`} />
        ))}
      </div>
      <div className="shooting-star" />
    </>
  )
}

// Arka plan: gece gökyüzü, yanıp sönen yıldızlar, ay, ara sıra kayan bir yıldız ve kar.
export function Sky() {
  return (
    <div className="sky" aria-hidden="true">
      <SkyLayers />
      <Snow />
    </div>
  )
}
