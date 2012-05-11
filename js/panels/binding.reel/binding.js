var Montage =	require("montage/core/core").Montage,
    PanelBase =	require("js/panels/panelbase").PanelBase;
////////////////////////////////////////////////////////////////////////
//Exporting as ColorPanel
exports.BindingPanel = Montage.create(PanelBase, {
    ////////////////////////////////////////////////////////////////////
    //Panel Configuration
    panelName: {
        value: "Color"
    }
});