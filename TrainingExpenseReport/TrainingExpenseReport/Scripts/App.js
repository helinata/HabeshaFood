var hostweburl;
var addinweburl;
var viewId = "BA02347D-6B2A-44AE-BF2D-CAC035AC5430";
var viewTitle = "OPC Agency FY Training Expense";

$(document).ready(function () {
    hostweburl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
    addinweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
    var scriptbase = hostweburl + "/_layouts/15/";
    $.getScript(scriptbase + "SP.RequestExecutor.js", getDisplayNames);
    $('input#Submit').click(function () {
        if (($('input#dtFrom').val() != '' && $('input#dtTo').val() != '') && ($('input#dtFrom').val() > $('input#dtTo').val())) {
            $('#message').css("visibility", "visible")
            return false;
        }
        else
            $('#message').css("visibility", "hidden")

        updateView();
    });
});

function validateDate() {
    if (($('input#dtFrom').val() != '' && $('input#dtTo').val() != '') && ($('input#dtFrom').val() > $('input#dtTo').val())) {
        $('#message').css("visibility", "visible")
        return false;
    }
}

function getDisplayNames() {
    var executor = new SP.RequestExecutor(addinweburl);

    executor.executeAsync({
        url: addinweburl +
      "/_api/SP.AppContextSite(@target)/web/Lists(guid'D8C9A7B2-C6CF-43DB-84EE-CCEEDA139F11')/items?@target='" + hostweburl + "'",
        method: "GET",
        headers: { "accept": "application/json; odata=verbose" },
        success: gdnSuccessHandler,
        error: gdnFailHandler
    });
}

function gdnSuccessHandler(data) {
    var body = JSON.parse(data.body);
    var result = body.d.results;
    for (var i = 0; i < result.length; i++) {
        var displayName = result[i].Display_x0020_Name;

        $("#lstDisplayName").append("<option value='" + displayName+ "'>" + displayName + "</option>");
    }
    console.log("Success");
}

function gdnFailHandler(data, errorCode, errorMessage) {
    console.log("Could not complete creating View: " + errorMessage);
}

function updateView() {
    var disName = $('#lstDisplayName').val();

    var thisYear = (new Date()).getFullYear();
    var stDate ="01/01/" + thisYear;
    var startDate = (new Date(stDate)).format("yyyy-MM-ddTHH:mm:ssZ");
    var dateFrom = (new Date($('input#dtFrom').val())).format("yyyy-MM-ddTHH:mm:ssZ")
    var dateTo = (new Date($('input#dtTo').val())).format("yyyy-MM-ddTHH:mm:ssZ")
    
    var dateFromQuery = ($('input#dtFrom').val() == '') ? "<Geq><FieldRef Name=\"Dt_x0020_From\" /><Value Type=\"DateTime\">" + startDate + "</Value></Geq>" : "<Geq><FieldRef Name=\"Dt_x0020_From\" /><Value Type=\"DateTime\">" + dateFrom + "</Value></Geq>";
    var dateToQuery = ($('input#dtTo').val() == '') ? "<Leq><FieldRef Name=\"Dt_x0020_To\" /><Value Type=\"DateTime\"><Today/></Value></Leq>" : "<Leq><FieldRef Name=\"Dt_x0020_To\" /><Value Type=\"DateTime\">" + dateTo + "</Value></Leq>";

    var query = "'<Where><And>" + dateFromQuery + dateToQuery + "</And></Where>'";
    if (disName != 'Please select')
        query = "'<Where><And><And>" + dateFromQuery + dateToQuery + "</And><Eq><FieldRef Name=\"Display_x0020_Name\" /><Value Type=\"Text\">" + disName + "</Value></Eq></And></Where>'";

    var executor = new SP.RequestExecutor(addinweburl);
    executor.executeAsync({
        url: addinweburl +
            "/_api/SP.AppContextSite(@target)/web/Lists(guid'D8C9A7B2-C6CF-43DB-84EE-CCEEDA139F11')/views('" + viewId + "')?@target='" + hostweburl + "'",
        method: "POST",
        body: "{ '__metadata': { 'type': 'SP.View' }, 'Title': '" + viewTitle + "', 'PersonalView': false, 'ViewQuery':" + query + "}",
        headers: {
            "content-type": "application/json;odata=verbose",
            "X-HTTP-Method": "MERGE"
        },
        success: uvSuccessHandler,
        error: uvFailHandler
    });
}

function uvSuccessHandler(data) {
    console.log("Success");

    window.open("https://opcdc.sharepoint.com/sites/TestSite/Professional%20Development/Forms/FY%20Training%20Expense%20Report.aspx", 'blank');
    return false;
}
   
function uvFailHandler(data, errorCode, errorMessage) {
   console.log("Could not complete creating View: " + errorMessage);
}

function getQueryStringParameter(paramToRetrieve) {
    var params =
        document.URL.split("?")[1].split("&");
    var strParams = "";
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve)
            return singleParam[1];
    }
}
