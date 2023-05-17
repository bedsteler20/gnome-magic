from gi.repository import Gtk


@Gtk.Template(resource_path='/@app_id_path@/window.ui')
class @pascal_project@Window(Gtk.ApplicationWindow):
    __gtype_name__ = '@pascal_project@Window'

    label = Gtk.Template.Child()

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def on_menubutton_activate():
        print("Hello World!")
