$_Doing__MSB__Test_ = true;

$_msb__ext__template_str = (function () {
    return '<div class="row">\
    <div class="col-xs-5 selectContainer">\
        <label>{{leftLabel}}</label>\
        <select name="colors" class="form-control" \
            ng-attr-size={{bheight}}\
            multiple="" title="select item" \
            ng-model="toRightSelected" \
            ng-options="item for item in datasource | orderBy: item"> \
        </select> \
    </div> \
    <div class="col-xs-2"> \
        <button style="margin-left:30%"  \
            class="btn btn-default input-height" type="button"  \
            name="to right" ng-click="toright()">  \
            <span class="glyphicon glyphicon-arrow-right"></span>  \
        </button> \
        <br><br> \
        <button style="margin-left:30%"  \
            class="btn btn-default input-height" type="button"  \
            name="to left" ng-click="toleft()">  \
            <span class="glyphicon glyphicon-arrow-left"></span>  \
        </button> \
    </div> \
 \
    <div class="col-xs-5 selectContainer pull-right"> \
        <label>{{rightLabel}}</label> \
        <select name="colors" class="form-control"  \
            ng-attr-size={{bheight}} \
            multiple="" title="select to left items"  \
            ng-model="toLeftSeleted"  \
            ng-options="item for item in selectedItems"> \
        </select> \
    </div> \
</div>'
}());

//console.log($_msb_ext_template_str);
