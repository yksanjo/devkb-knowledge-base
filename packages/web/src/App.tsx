import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Entries from './pages/Entries';
import AddEntry from './pages/AddEntry';
import Stats from './pages/Stats';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header>
          <div className="container">
            <Link to="/" className="logo">DevKB</Link>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/search">Search</Link>
              <Link to="/entries">Entries</Link>
              <Link to="/add">Add</Link>
              <Link to="/stats">Stats</Link>
            </nav>
          </div>
        </header>

        <main>
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/entries" element={<Entries />} />
              <Route path="/add" element={<AddEntry />} />
              <Route path="/stats" element={<Stats />} />
            </Routes>
          </div>
        </main>

        <footer>
          <div className="container">
            <p>DevKB - Developer Knowledge Base &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
