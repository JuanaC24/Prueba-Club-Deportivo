const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const PORT = 3000;
const filePath = path.join(__dirname, 'deportes.json');

// Funciones auxiliares para leer y escribir el archivo JSON
function leerDeportes(callback) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            callback(err, null);
        } else {
            const deportes = JSON.parse(data || '[]');
            callback(null, deportes);
        }
    });
}

function escribirDeportes(deportes, callback) {
    fs.writeFile(filePath, JSON.stringify(deportes, null, 2), (err) => {
        if (err) {
            console.error("Error writing file:", err);
            callback(err);
        } else {
            callback(null);
        }
    });
}

// Ruta para obtener todos los deportes
app.get('/deportes', (req, res) => {
    leerDeportes((err, deportes) => {
        if (err) return res.status(500).json({ error: 'Error al leer el archivo de deportes', details: err });
        res.json({ deportes });
    });
});

// Ruta para agregar un nuevo deporte
app.post('/agregar', (req, res) => {
    const { nombre, precio } = req.body;
    if (!nombre || precio == null) {
        return res.status(400).send('Nombre y precio son requeridos');
    }

    leerDeportes((err, deportes) => {
        if (err) return res.status(500).json({ error: 'Error al leer el archivo de deportes', details: err });

        deportes.push({ nombre, precio });
        escribirDeportes(deportes, (err) => {
            if (err) return res.status(500).json({ error: 'Error al escribir en el archivo de deportes', details: err });
            res.send('Deporte agregado exitosamente');
        });
    });
});

// Ruta para editar el precio de un deporte
app.put('/editar', (req, res) => {
    const { nombre, precio } = req.body;
    if (!nombre || precio == null) {
        return res.status(400).send('Nombre y precio son requeridos');
    }

    leerDeportes((err, deportes) => {
        if (err) return res.status(500).json({ error: 'Error al leer el archivo de deportes', details: err });

        let deporteEncontrado = deportes.find(d => d.nombre === nombre);
        if (deporteEncontrado) {
            deporteEncontrado.precio = precio;
            escribirDeportes(deportes, (err) => {
                if (err) return res.status(500).json({ error: 'Error al escribir en el archivo de deportes', details: err });
                res.send('Deporte actualizado exitosamente');
            });
        } else {
            res.status(404).send('Deporte no encontrado');
        }
    });
});

// Ruta para eliminar un deporte
app.delete('/eliminar/:nombre', (req, res) => {
    const { nombre } = req.params;
    console.log('Intentando eliminar:', nombre);
    if (!nombre) {
        console.error('Solicitud DELETE sin nombre especificado');
        return res.status(400).send('Nombre del deporte es requerido');
    }

    leerDeportes((err, deportes) => {
        if (err) return res.status(500).json({ error: 'Error al leer el archivo de deportes', details: err });

        const nuevosDeportes = deportes.filter(deporte => deporte.nombre !== nombre);
        escribirDeportes(nuevosDeportes, (err) => {
            if (err) return res.status(500).json({ error: 'Error al escribir en el archivo de deportes', details: err });
            res.send('Deporte eliminado exitosamente');
        });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
