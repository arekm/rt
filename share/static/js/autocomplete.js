jQuery(function() {

    var cssClassMap = {
        Users: 'user',
        Groups: 'group'
    };

    jQuery("input[data-autocomplete]").each(function(){
        var input = jQuery(this);
        var what  = input.attr("data-autocomplete");
        var wants = input.attr("data-autocomplete-return");

        if (!what || !what.match(/^(Users|Groups|Tickets)$/))
            return;

        var queryargs = [];
        var options = {
            source: RT.Config.WebHomePath + "/Helpers/Autocomplete/" + what
        };

        if ( wants ) {
            queryargs.push("return=" + wants);
        }

        if (input.is('[data-autocomplete-privileged]')) {
            queryargs.push("privileged=1");
        }

        if (input.is('[data-autocomplete-multiple]')) {
            if ( what != 'Tickets' ) {
                queryargs.push("delim=,");
            }

            options.focus = function () {
                // prevent value inserted on focus
                return false;
            }

            options.select = function(event, ui) {
                var terms = this.value.split(what == 'Tickets' ? /\s+/ : /,\s*/);
                terms.pop();                    // remove current input
                terms.push( ui.item.value );    // add selected item
                if ( what == 'Tickets' ) {
                    // remove non-integers in case subject search with spaces in (like "foo bar")
                    terms = jQuery.grep(terms, function(term) {
                        var str = term + ''; // stringify integers to call .match
                        return str.match(/^\d+$/);
                    } );
                    terms.push(''); // add trailing space so user can input another ticket id directly
                }
                this.value = terms.join(what == 'Tickets' ? ' ' : ", ");
                return false;
            }
        }

        var exclude = input.attr('data-autocomplete-exclude');
        if (exclude) {
            queryargs.push("exclude="+exclude);
        }

        if (queryargs.length)
            options.source += "?" + queryargs.join("&");

        input.addClass('autocompletes-' + cssClassMap[what] )
            .autocomplete(options)
            .data("ui-autocomplete")
            ._renderItem = function(ul, item) {
                var rendered = jQuery("<a/>");

                if (item.html == null)
                    rendered.text( item.label );
                else
                    rendered.html( item.html );

                return jQuery("<li/>")
                    .data( "item.autocomplete", item )
                    .append( rendered )
                    .appendTo( ul );
            };
    });
});