---
title: "Qt"
order: 11
summary: "Desktop apps with Qt 6: the event loop, widgets and layouts, signals and slots, main windows, dialogs, model/view, QML, threads, CMake builds and PySide6."
category: "Qt"
level: Intermediate
---

# Qt

Qt is a cross-platform C++ framework for desktop, embedded and mobile interfaces. One codebase builds native-looking apps for Windows, macOS and Linux. This module covers Qt 6 with C++ and CMake, and ends with PySide6, the official Python binding.

> **Note:** Qt's documentation is licensed under the GNU FDL, which can't be mixed into this site's CC BY-SA content, so this module is written for Atlas CE from scratch. Each topic links to the matching page of the [official docs](https://doc.qt.io/qt-6/).

## How a Qt App Works

> **Official docs:** [QApplication](https://doc.qt.io/qt-6/qapplication.html), [The Event System](https://doc.qt.io/qt-6/eventsandfilters.html)

Every Qt GUI program has the same skeleton: create one application object, build and show the windows, then hand control to the **event loop**.

```cpp
#include <QApplication>
#include <QLabel>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);   // exactly one, before any widget

    QLabel label("Hello, Qt!");
    label.resize(240, 80);
    label.show();

    return app.exec();              // runs the event loop until the last window closes
}
```

`app.exec()` doesn't return until the app quits. Inside it, Qt waits for events (mouse clicks, key presses, timers, repaint requests, network data) and dispatches each to the object it belongs to.

That has one big consequence: **never block the event loop**. A long computation or a blocking network call inside a click handler freezes the whole window, because nothing else can be processed until it returns. Long work goes to a thread (see [Threads and Responsiveness](/languages/qt/threads-and-responsiveness)) or uses Qt's asynchronous APIs.

## Widgets and Parent Ownership

> **Official docs:** [Object Trees & Ownership](https://doc.qt.io/qt-6/objecttrees.html), [QWidget](https://doc.qt.io/qt-6/qwidget.html)

Widgets are the visible building blocks: `QPushButton`, `QLineEdit`, `QLabel`, `QComboBox`, `QCheckBox`, `QTableView` and many more, all deriving from `QWidget`.

Qt objects form a **parent–child tree**. A child is drawn inside its parent, and when the parent is deleted it deletes all its children. That's how Qt handles memory: create children with `new` and give them a parent, and you don't `delete` them yourself.

```cpp
auto *window = new QWidget;                  // top-level: no parent
auto *button = new QPushButton("OK", window); // owned by window

window->show();
// When window is destroyed, button is destroyed with it.
```

Rules of thumb:

- Top-level windows either live on the stack in `main()` or are deleted by you (or with `setAttribute(Qt::WA_DeleteOnClose)`).
- Everything inside a window gets a parent, usually set automatically when you add it to a layout.
- Don't put a widget with a parent on the stack: the parent would try to delete it a second time.

## Layouts

> **Official docs:** [Layout Management](https://doc.qt.io/qt-6/layout.html)

Never position widgets with fixed coordinates. Layouts size and place children for you, and adapt to window resizing, fonts and translations.

```cpp
#include <QApplication>
#include <QFormLayout>
#include <QHBoxLayout>
#include <QLineEdit>
#include <QPushButton>
#include <QVBoxLayout>
#include <QWidget>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);
    QWidget window;

    auto *form = new QFormLayout;
    form->addRow("Name:", new QLineEdit);
    form->addRow("Email:", new QLineEdit);

    auto *buttons = new QHBoxLayout;
    buttons->addStretch();                  // pushes the buttons to the right
    buttons->addWidget(new QPushButton("Cancel"));
    buttons->addWidget(new QPushButton("Save"));

    auto *root = new QVBoxLayout(&window);  // installs itself on the window
    root->addLayout(form);
    root->addLayout(buttons);

    window.show();
    return app.exec();
}
```

The main layouts:

| Layout | Arranges children |
| --- | --- |
| `QVBoxLayout` | top to bottom |
| `QHBoxLayout` | left to right |
| `QGridLayout` | in rows and columns, with spans |
| `QFormLayout` | label–field pairs |

Layouts nest, `addStretch()` adds flexible empty space, and a widget's size policy says whether it may grow or shrink.

## Signals and Slots

> **Official docs:** [Signals & Slots](https://doc.qt.io/qt-6/signalsandslots.html)

Signals and slots are how Qt objects talk without knowing about each other. An object **emits a signal** when something happens; any number of **slots** (functions) connected to it run in response.

```cpp
auto *button = new QPushButton("Count");
auto *label  = new QLabel("0");
int clicks = 0;

// Connect with member-function pointers: checked at compile time.
QObject::connect(button, &QPushButton::clicked, label, [label, &clicks] {
    label->setNum(++clicks);
});
```

Defining your own signals needs the `Q_OBJECT` macro, which Qt's meta-object compiler (moc) uses to generate the plumbing:

```cpp
class Thermometer : public QObject
{
    Q_OBJECT
public:
    void setTemperature(double celsius)
    {
        if (qFuzzyCompare(m_celsius, celsius))
            return;
        m_celsius = celsius;
        emit temperatureChanged(celsius);   // notify whoever is listening
    }

signals:
    void temperatureChanged(double celsius);

private:
    double m_celsius = 0;
};
```

Things to know:

- Prefer the function-pointer `connect` syntax above to the old `SIGNAL()`/`SLOT()` string macros: typos become compile errors.
- When a lambda captures a widget, pass that widget as the third argument (the *context*). The connection is removed automatically if the widget is destroyed.
- Connections across threads are queued: the slot runs later, in the receiver's thread. That's what makes threading safe in Qt.

## Main Windows, Menus and Actions

> **Official docs:** [QMainWindow](https://doc.qt.io/qt-6/qmainwindow.html), [QAction](https://doc.qt.io/qt-6/qaction.html)

Real applications usually derive from `QMainWindow`, which provides a menu bar, toolbars, a status bar, dockable panels and a central widget.

```cpp
class MainWindow : public QMainWindow
{
    Q_OBJECT
public:
    MainWindow()
    {
        setCentralWidget(m_editor = new QPlainTextEdit);

        auto *open = new QAction(tr("&Open…"), this);
        open->setShortcut(QKeySequence::Open);
        connect(open, &QAction::triggered, this, &MainWindow::openFile);

        auto *quit = new QAction(tr("&Quit"), this);
        quit->setShortcut(QKeySequence::Quit);
        connect(quit, &QAction::triggered, qApp, &QApplication::quit);

        QMenu *file = menuBar()->addMenu(tr("&File"));
        file->addAction(open);
        file->addSeparator();
        file->addAction(quit);

        addToolBar(tr("File"))->addAction(open);
        statusBar()->showMessage(tr("Ready"));
    }

private:
    void openFile();
    QPlainTextEdit *m_editor;
};
```

A `QAction` is one command shared by menus, toolbars and shortcuts: disable it once and every place that shows it is disabled. Wrapping user-visible text in `tr()` makes it translatable later.

## Dialogs and Files

> **Official docs:** [QFileDialog](https://doc.qt.io/qt-6/qfiledialog.html), [QMessageBox](https://doc.qt.io/qt-6/qmessagebox.html), [QFile](https://doc.qt.io/qt-6/qfile.html)

Qt ships the standard dialogs, using the native ones on each platform:

```cpp
void MainWindow::openFile()
{
    const QString path = QFileDialog::getOpenFileName(
        this, tr("Open File"), QDir::homePath(), tr("Text files (*.txt *.md)"));
    if (path.isEmpty())
        return;                                   // user cancelled

    QFile file(path);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) {
        QMessageBox::warning(this, tr("Open failed"), file.errorString());
        return;
    }
    m_editor->setPlainText(QString::fromUtf8(file.readAll()));
    statusBar()->showMessage(tr("Opened %1").arg(path), 3000);
}
```

Custom dialogs derive from `QDialog`. `exec()` shows them modally and returns `QDialog::Accepted` or `Rejected`; `open()` shows them without blocking and reports through the `finished` signal. `QSettings` stores preferences (window geometry, recent files) in the platform's usual place.

## Model/View

> **Official docs:** [Model/View Programming](https://doc.qt.io/qt-6/model-view-programming.html)

For lists, tables and trees Qt separates the **data** (a model) from its **presentation** (a view). The same model can feed several views, and a view never copies the data.

The simplest start is a ready-made model:

```cpp
auto *model = new QStandardItemModel(0, 2, this);
model->setHorizontalHeaderLabels({tr("Name"), tr("Size")});
model->appendRow({new QStandardItem("report.pdf"), new QStandardItem("2.4 MB")});

auto *view = new QTableView;
view->setModel(model);
view->setSortingEnabled(true);
```

For large or live data, subclass `QAbstractTableModel` and answer the view's questions on demand:

```cpp
class TaskModel : public QAbstractTableModel
{
public:
    int rowCount(const QModelIndex & = {}) const override { return m_tasks.size(); }
    int columnCount(const QModelIndex & = {}) const override { return 2; }

    QVariant data(const QModelIndex &index, int role) const override
    {
        if (role != Qt::DisplayRole)
            return {};
        const Task &t = m_tasks.at(index.row());
        return index.column() == 0 ? QVariant(t.title) : QVariant(t.done ? tr("Done") : tr("Open"));
    }

private:
    QList<Task> m_tasks;
};
```

When the data changes, the model emits signals (`dataChanged`, or `beginInsertRows()`/`endInsertRows()` around inserts) and every attached view updates itself. A `QSortFilterProxyModel` placed between model and view adds sorting and filtering without touching the source.

## QML and Qt Quick

> **Official docs:** [Qt Quick](https://doc.qt.io/qt-6/qtquick-index.html), [First Steps with QML](https://doc.qt.io/qt-6/qmlfirststeps.html)

Widgets suit classic desktop tools. For fluid, animated or touch interfaces Qt offers **Qt Quick**, written in QML, a declarative language with JavaScript expressions:

```qml
import QtQuick
import QtQuick.Controls

ApplicationWindow {
    width: 360; height: 240
    visible: true
    title: "Counter"

    property int count: 0

    Column {
        anchors.centerIn: parent
        spacing: 12

        Label { text: "Clicked " + count + " times" }   // updates automatically
        Button { text: "Click me"; onClicked: count++ }
    }
}
```

Property bindings are QML's core idea: `text: "Clicked " + count + " times"` is re-evaluated whenever `count` changes, with no manual update code.

The usual split is UI in QML, logic in C++. A C++ class exposed to QML uses `Q_PROPERTY` for bindable values, `Q_INVOKABLE` for callable methods and `QML_ELEMENT` to register itself. QML reacts to its `NOTIFY` signals.

## Threads and Responsiveness

> **Official docs:** [Threading Basics](https://doc.qt.io/qt-6/thread-basics.html), [Qt Concurrent](https://doc.qt.io/qt-6/qtconcurrent-index.html)

Widgets may only be touched from the main (GUI) thread. Heavy work runs elsewhere and reports back through signals, which Qt delivers safely across threads.

For one-off tasks, `QtConcurrent::run` plus a watcher is the simplest route:

```cpp
auto *watcher = new QFutureWatcher<QImage>(this);
connect(watcher, &QFutureWatcher<QImage>::finished, this, [this, watcher] {
    m_preview->setPixmap(QPixmap::fromImage(watcher->result()));   // back on the GUI thread
    watcher->deleteLater();
});
watcher->setFuture(QtConcurrent::run([path] { return loadAndScale(path); }));  // worker thread
```

For a long-lived background job, move a worker object to a `QThread`:

```cpp
auto *thread = new QThread(this);
auto *worker = new Indexer;                  // a QObject with a slot doing the work
worker->moveToThread(thread);

connect(thread, &QThread::started, worker, &Indexer::run);
connect(worker, &Indexer::progress, this, &MainWindow::showProgress);  // queued to GUI thread
connect(worker, &Indexer::finished, thread, &QThread::quit);
connect(thread, &QThread::finished, worker, &QObject::deleteLater);

thread->start();
```

Network and file APIs such as `QNetworkAccessManager` are already asynchronous: they signal when data arrives, so they don't need a thread at all.

## Building with CMake

> **Official docs:** [Building with CMake](https://doc.qt.io/qt-6/cmake-get-started.html)

Qt 6 uses CMake. A minimal project:

```cmake
cmake_minimum_required(VERSION 3.16)
project(notes VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Qt6 REQUIRED COMPONENTS Widgets)
qt_standard_project_setup()          # turns on moc, uic and rcc automatically

qt_add_executable(notes
    main.cpp
    mainwindow.cpp mainwindow.h
)

target_link_libraries(notes PRIVATE Qt6::Widgets)
```

```bash
cmake -S . -B build -DCMAKE_PREFIX_PATH=~/Qt/6.8.0/gcc_64
cmake --build build
./build/notes
```

`qt_standard_project_setup()` enables the code generators Qt needs: **moc** for `Q_OBJECT` classes, **uic** for `.ui` forms made in Qt Designer, and **rcc** for resources (icons and files compiled into the binary). Qt Creator opens `CMakeLists.txt` directly. For distribution, `windeployqt` and `macdeployqt` copy the Qt libraries next to the executable.

## Qt for Python (PySide6)

> **Official docs:** [Qt for Python](https://doc.qt.io/qtforpython-6/)

PySide6 is the official Python binding: the same classes, signals and layouts, without a compile step.

```bash
python -m venv .venv && source .venv/bin/activate
pip install pyside6
```

```python
import sys
from PySide6.QtCore import Signal, QObject
from PySide6.QtWidgets import QApplication, QLabel, QPushButton, QVBoxLayout, QWidget


class Counter(QObject):
    changed = Signal(int)          # custom signals are class attributes

    def __init__(self):
        super().__init__()
        self.value = 0

    def increment(self):
        self.value += 1
        self.changed.emit(self.value)


app = QApplication(sys.argv)
window = QWidget()
label = QLabel("0")
button = QPushButton("Count")
counter = Counter()

button.clicked.connect(counter.increment)
counter.changed.connect(label.setNum)

layout = QVBoxLayout(window)
layout.addWidget(label)
layout.addWidget(button)

window.show()
sys.exit(app.exec())
```

PySide6 is a good fit for internal tools, prototypes and apps that lean on Python libraries; C++ remains the choice when startup time, memory or embedded targets matter. Both are licensed under the LGPL, which permits closed-source apps that link Qt dynamically; check Qt's licensing terms before shipping.
