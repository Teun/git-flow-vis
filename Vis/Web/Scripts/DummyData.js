var Dummy = {

    // basic version 3 features, 2 releases
    Data: {
        branches: { "size": 5, "limit": 25, "isLastPage": true, "values": [{ "id": "refs/heads/master", "displayId": "master", "latestChangeset": "1c5b2a0e3e7171d42a74cb4701f42d7901969819", "isDefault": true }, { "id": "refs/heads/integration", "displayId": "integration", "latestChangeset": "5bb8f7a48da4075bba6f15a7b74ba6fd38b5ce40", "isDefault": false }, { "id": "refs/heads/feature/f3", "displayId": "feature/f3", "latestChangeset": "e322223854e59592be5bd39665d57fcbc8c6e404", "isDefault": false }, { "id": "refs/heads/feature/f2", "displayId": "feature/f2", "latestChangeset": "ce3507310d588a97b5fe5395038e5f4b540446a8", "isDefault": false }, { "id": "refs/heads/feature/f1", "displayId": "feature/f1", "latestChangeset": "ed0c27592dee3dc2c905f6f81eae29ac19c43858", "isDefault": false }, { "id": "refs/heads/feature/f4", "displayId": "feature/f4", "latestChangeset": "fd0c27592dee3dc2c905f6f81eae29ac19c43858", "isDefault": false }], "start": 0, "filter": null },
        commits: [
            { "size": 15, "limit": 25, "isLastPage": true, "values": [{ "id": "1c5b2a0e3e7171d42a74cb4701f42d7901969819", "displayId": "1c5b2a0", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373387759000, "message": "Merge branch 'release/2.0.0'", "parents": [{ "id": "990f15c7f27a509ca62ef9c782c0b9418d7256ec", "displayId": "990f15c" }, { "id": "5bb8f7a48da4075bba6f15a7b74ba6fd38b5ce40", "displayId": "5bb8f7a" }] }, { "id": "5bb8f7a48da4075bba6f15a7b74ba6fd38b5ce40", "displayId": "5bb8f7a", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295593000, "message": "Merge pull request #3 in ZAN/sample from ZAN/sample-teamfork:feature/f3 to integration\n\n* commit 'e322223854e59592be5bd39665d57fcbc8c6e404':\n  f3", "parents": [{ "id": "eae6dac333c894f3da629da161236120797ccf3b", "displayId": "eae6dac" }, { "id": "e322223854e59592be5bd39665d57fcbc8c6e404", "displayId": "e322223" }] }, { "id": "e322223854e59592be5bd39665d57fcbc8c6e404", "displayId": "e322223", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295364000, "message": "Merge branch 'integration' of http://git.funda.nl/scm/zan/sample-teamfork into feature/f3\n\nConflicts:\n\ttest.txt", "parents": [{ "id": "7c155db5613f3c9d8ac23975785daedbcc8b1638", "displayId": "7c155db" }, { "id": "eae6dac333c894f3da629da161236120797ccf3b", "displayId": "eae6dac" }] }, { "id": "eae6dac333c894f3da629da161236120797ccf3b", "displayId": "eae6dac", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295196000, "message": "Merge pull request #2 in ZAN/sample from ZAN/sample-teamfork:feature/f2 to integration\n\n* commit 'ce3507310d588a97b5fe5395038e5f4b540446a8':\n  commit 3 for f2\n  commit 2 for f2\n  commit 1 for f2", "parents": [{ "id": "4bf83e5d2e1a44d0008568bb3eef04740a6e57a8", "displayId": "4bf83e5" }, { "id": "ce3507310d588a97b5fe5395038e5f4b540446a8", "displayId": "ce35073" }] }, { "id": "ce3507310d588a97b5fe5395038e5f4b540446a8", "displayId": "ce35073", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295153000, "message": "Merge branch 'integration' of http://git.funda.nl/scm/zan/sample-teamfork into feature/f2\n\nConflicts:\n\ttest.txt", "parents": [{ "id": "80684fee781aecab0a33aa8be15578b8129c9a50", "displayId": "80684fe" }, { "id": "4bf83e5d2e1a44d0008568bb3eef04740a6e57a8", "displayId": "4bf83e5" }] }, { "id": "7c155db5613f3c9d8ac23975785daedbcc8b1638", "displayId": "7c155db", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295003000, "message": "f3", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }] }, { "id": "4bf83e5d2e1a44d0008568bb3eef04740a6e57a8", "displayId": "4bf83e5", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294824000, "message": "Merge branch 'release/1.0.0' into integration", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }, { "id": "88377ef538655d8ba5f769a20ccf290e56b6c09a", "displayId": "88377ef" }] }, { "id": "990f15c7f27a509ca62ef9c782c0b9418d7256ec", "displayId": "990f15c", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294823000, "message": "Merge branch 'release/1.0.0'", "parents": [{ "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec" }, { "id": "88377ef538655d8ba5f769a20ccf290e56b6c09a", "displayId": "88377ef" }] }, { "id": "88377ef538655d8ba5f769a20ccf290e56b6c09a", "displayId": "88377ef", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294806000, "message": "fix for 1.0.0", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }] }, { "id": "80684fee781aecab0a33aa8be15578b8129c9a50", "displayId": "80684fe", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294709000, "message": "commit 3 for f2", "parents": [{ "id": "ac4fcc3929eb1e7c769fc73d41dcf8211cb27183", "displayId": "ac4fcc3" }] }, { "id": "ac4fcc3929eb1e7c769fc73d41dcf8211cb27183", "displayId": "ac4fcc3", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294678000, "message": "commit 2 for f2", "parents": [{ "id": "606b368f354652186eff6bf0c6c59a2de59e7a70", "displayId": "606b368" }] }, { "id": "606b368f354652186eff6bf0c6c59a2de59e7a70", "displayId": "606b368", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294658000, "message": "commit 1 for f2", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }] }, { "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294435000, "message": "Merge pull request #1 in ZAN/sample from ZAN/sample-teamfork:feature/f1 to integration\n\n* commit 'ed0c27592dee3dc2c905f6f81eae29ac19c43858':\n  f1 Create file", "parents": [{ "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec" }, { "id": "ed0c27592dee3dc2c905f6f81eae29ac19c43858", "displayId": "ed0c275" }] }, { "id": "ed0c27592dee3dc2c905f6f81eae29ac19c43858", "displayId": "ed0c275", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294364000, "message": "f1\nCreate file", "parents": [{ "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec" }] }, { "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294076000, "message": "gitignore", "parents": [] }], "start": 0, "filter": null },
            { "size": 13, "limit": 25, "isLastPage": true, "values": [{ "id": "5bb8f7a48da4075bba6f15a7b74ba6fd38b5ce40", "displayId": "5bb8f7a", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295593000, "message": "Merge pull request #3 in ZAN/sample from ZAN/sample-teamfork:feature/f3 to integration\n\n* commit 'e322223854e59592be5bd39665d57fcbc8c6e404':\n  f3", "parents": [{ "id": "eae6dac333c894f3da629da161236120797ccf3b", "displayId": "eae6dac" }, { "id": "e322223854e59592be5bd39665d57fcbc8c6e404", "displayId": "e322223" }] }, { "id": "e322223854e59592be5bd39665d57fcbc8c6e404", "displayId": "e322223", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295364000, "message": "Merge branch 'integration' of http://git.funda.nl/scm/zan/sample-teamfork into feature/f3\n\nConflicts:\n\ttest.txt", "parents": [{ "id": "7c155db5613f3c9d8ac23975785daedbcc8b1638", "displayId": "7c155db" }, { "id": "eae6dac333c894f3da629da161236120797ccf3b", "displayId": "eae6dac" }] }, { "id": "eae6dac333c894f3da629da161236120797ccf3b", "displayId": "eae6dac", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295196000, "message": "Merge pull request #2 in ZAN/sample from ZAN/sample-teamfork:feature/f2 to integration\n\n* commit 'ce3507310d588a97b5fe5395038e5f4b540446a8':\n  commit 3 for f2\n  commit 2 for f2\n  commit 1 for f2", "parents": [{ "id": "4bf83e5d2e1a44d0008568bb3eef04740a6e57a8", "displayId": "4bf83e5" }, { "id": "ce3507310d588a97b5fe5395038e5f4b540446a8", "displayId": "ce35073" }] }, { "id": "ce3507310d588a97b5fe5395038e5f4b540446a8", "displayId": "ce35073", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295153000, "message": "Merge branch 'integration' of http://git.funda.nl/scm/zan/sample-teamfork into feature/f2\n\nConflicts:\n\ttest.txt", "parents": [{ "id": "80684fee781aecab0a33aa8be15578b8129c9a50", "displayId": "80684fe" }, { "id": "4bf83e5d2e1a44d0008568bb3eef04740a6e57a8", "displayId": "4bf83e5" }] }, { "id": "7c155db5613f3c9d8ac23975785daedbcc8b1638", "displayId": "7c155db", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295003000, "message": "f3", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }] }, { "id": "4bf83e5d2e1a44d0008568bb3eef04740a6e57a8", "displayId": "4bf83e5", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294824000, "message": "Merge branch 'release/1.0.0' into integration", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }, { "id": "88377ef538655d8ba5f769a20ccf290e56b6c09a", "displayId": "88377ef" }] }, { "id": "88377ef538655d8ba5f769a20ccf290e56b6c09a", "displayId": "88377ef", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294806000, "message": "fix for 1.0.0", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }] }, { "id": "80684fee781aecab0a33aa8be15578b8129c9a50", "displayId": "80684fe", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294709000, "message": "commit 3 for f2", "parents": [{ "id": "ac4fcc3929eb1e7c769fc73d41dcf8211cb27183", "displayId": "ac4fcc3" }] }, { "id": "ac4fcc3929eb1e7c769fc73d41dcf8211cb27183", "displayId": "ac4fcc3", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294678000, "message": "commit 2 for f2", "parents": [{ "id": "606b368f354652186eff6bf0c6c59a2de59e7a70", "displayId": "606b368" }] }, { "id": "606b368f354652186eff6bf0c6c59a2de59e7a70", "displayId": "606b368", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294658000, "message": "commit 1 for f2", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }] }, { "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294435000, "message": "Merge pull request #1 in ZAN/sample from ZAN/sample-teamfork:feature/f1 to integration\n\n* commit 'ed0c27592dee3dc2c905f6f81eae29ac19c43858':\n  f1 Create file", "parents": [{ "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec" }, { "id": "ed0c27592dee3dc2c905f6f81eae29ac19c43858", "displayId": "ed0c275" }] }, { "id": "ed0c27592dee3dc2c905f6f81eae29ac19c43858", "displayId": "ed0c275", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294364000, "message": "f1\nCreate file", "parents": [{ "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec" }] }, { "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294076000, "message": "gitignore", "parents": [] }], "start": 0, "filter": null },
            { "size": 12, "limit": 25, "isLastPage": true, "values": [{ "id": "e322223854e59592be5bd39665d57fcbc8c6e404", "displayId": "e322223", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295364000, "message": "Merge branch 'integration' of http://git.funda.nl/scm/zan/sample-teamfork into feature/f3\n\nConflicts:\n\ttest.txt", "parents": [{ "id": "7c155db5613f3c9d8ac23975785daedbcc8b1638", "displayId": "7c155db" }, { "id": "eae6dac333c894f3da629da161236120797ccf3b", "displayId": "eae6dac" }] }, { "id": "eae6dac333c894f3da629da161236120797ccf3b", "displayId": "eae6dac", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295196000, "message": "Merge pull request #2 in ZAN/sample from ZAN/sample-teamfork:feature/f2 to integration\n\n* commit 'ce3507310d588a97b5fe5395038e5f4b540446a8':\n  commit 3 for f2\n  commit 2 for f2\n  commit 1 for f2", "parents": [{ "id": "4bf83e5d2e1a44d0008568bb3eef04740a6e57a8", "displayId": "4bf83e5" }, { "id": "ce3507310d588a97b5fe5395038e5f4b540446a8", "displayId": "ce35073" }] }, { "id": "ce3507310d588a97b5fe5395038e5f4b540446a8", "displayId": "ce35073", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295153000, "message": "Merge branch 'integration' of http://git.funda.nl/scm/zan/sample-teamfork into feature/f2\n\nConflicts:\n\ttest.txt", "parents": [{ "id": "80684fee781aecab0a33aa8be15578b8129c9a50", "displayId": "80684fe" }, { "id": "4bf83e5d2e1a44d0008568bb3eef04740a6e57a8", "displayId": "4bf83e5" }] }, { "id": "7c155db5613f3c9d8ac23975785daedbcc8b1638", "displayId": "7c155db", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295003000, "message": "f3", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }] }, { "id": "4bf83e5d2e1a44d0008568bb3eef04740a6e57a8", "displayId": "4bf83e5", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294824000, "message": "Merge branch 'release/1.0.0' into integration", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }, { "id": "88377ef538655d8ba5f769a20ccf290e56b6c09a", "displayId": "88377ef" }] }, { "id": "88377ef538655d8ba5f769a20ccf290e56b6c09a", "displayId": "88377ef", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294806000, "message": "fix for 1.0.0", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }] }, { "id": "80684fee781aecab0a33aa8be15578b8129c9a50", "displayId": "80684fe", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294709000, "message": "commit 3 for f2", "parents": [{ "id": "ac4fcc3929eb1e7c769fc73d41dcf8211cb27183", "displayId": "ac4fcc3" }] }, { "id": "ac4fcc3929eb1e7c769fc73d41dcf8211cb27183", "displayId": "ac4fcc3", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294678000, "message": "commit 2 for f2", "parents": [{ "id": "606b368f354652186eff6bf0c6c59a2de59e7a70", "displayId": "606b368" }] }, { "id": "606b368f354652186eff6bf0c6c59a2de59e7a70", "displayId": "606b368", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294658000, "message": "commit 1 for f2", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }] }, { "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294435000, "message": "Merge pull request #1 in ZAN/sample from ZAN/sample-teamfork:feature/f1 to integration\n\n* commit 'ed0c27592dee3dc2c905f6f81eae29ac19c43858':\n  f1 Create file", "parents": [{ "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec" }, { "id": "ed0c27592dee3dc2c905f6f81eae29ac19c43858", "displayId": "ed0c275" }] }, { "id": "ed0c27592dee3dc2c905f6f81eae29ac19c43858", "displayId": "ed0c275", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294364000, "message": "f1\nCreate file", "parents": [{ "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec" }] }, { "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294076000, "message": "gitignore", "parents": [] }], "start": 0, "filter": null },
            { "size": 9, "limit": 25, "isLastPage": true, "values": [{ "id": "ce3507310d588a97b5fe5395038e5f4b540446a8", "displayId": "ce35073", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295153000, "message": "Merge branch 'integration' of http://git.funda.nl/scm/zan/sample-teamfork into feature/f2\n\nConflicts:\n\ttest.txt", "parents": [{ "id": "80684fee781aecab0a33aa8be15578b8129c9a50", "displayId": "80684fe" }, { "id": "4bf83e5d2e1a44d0008568bb3eef04740a6e57a8", "displayId": "4bf83e5" }] }, { "id": "4bf83e5d2e1a44d0008568bb3eef04740a6e57a8", "displayId": "4bf83e5", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294824000, "message": "Merge branch 'release/1.0.0' into integration", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }, { "id": "88377ef538655d8ba5f769a20ccf290e56b6c09a", "displayId": "88377ef" }] }, { "id": "88377ef538655d8ba5f769a20ccf290e56b6c09a", "displayId": "88377ef", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294806000, "message": "fix for 1.0.0", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }] }, { "id": "80684fee781aecab0a33aa8be15578b8129c9a50", "displayId": "80684fe", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294709000, "message": "commit 3 for f2", "parents": [{ "id": "ac4fcc3929eb1e7c769fc73d41dcf8211cb27183", "displayId": "ac4fcc3" }] }, { "id": "ac4fcc3929eb1e7c769fc73d41dcf8211cb27183", "displayId": "ac4fcc3", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294678000, "message": "commit 2 for f2", "parents": [{ "id": "606b368f354652186eff6bf0c6c59a2de59e7a70", "displayId": "606b368" }] }, { "id": "606b368f354652186eff6bf0c6c59a2de59e7a70", "displayId": "606b368", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294658000, "message": "commit 1 for f2", "parents": [{ "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7" }] }, { "id": "d0473d7f77ab767bb733f9888b646a1796f38e42", "displayId": "d0473d7", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294435000, "message": "Merge pull request #1 in ZAN/sample from ZAN/sample-teamfork:feature/f1 to integration\n\n* commit 'ed0c27592dee3dc2c905f6f81eae29ac19c43858':\n  f1 Create file", "parents": [{ "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec" }, { "id": "ed0c27592dee3dc2c905f6f81eae29ac19c43858", "displayId": "ed0c275" }] }, { "id": "ed0c27592dee3dc2c905f6f81eae29ac19c43858", "displayId": "ed0c275", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294364000, "message": "f1\nCreate file", "parents": [{ "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec" }] }, { "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294076000, "message": "gitignore", "parents": [] }], "start": 0, "filter": null },
            { "size": 2, "limit": 25, "isLastPage": true, "values": [{ "id": "ed0c27592dee3dc2c905f6f81eae29ac19c43858", "displayId": "ed0c275", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294364000, "message": "f1\nCreate file", "parents": [{ "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec" }] }, { "id": "9f82fec3064641afea8c8e028b920ec3edc05c2b", "displayId": "9f82fec", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373294076000, "message": "gitignore", "parents": [] }], "start": 0, "filter": null },
            { "size": 2, "limit": 25, "isLastPage": true, "values": [{ "id": "fd0c27592dee3dc2c905f6f81eae29ac19c43858", "displayId": "fd0c275", "author": { "name": "Teun Duynstee", "emailAddress": "teun@funda.nl" }, "authorTimestamp": 1373295693000, "message": "f1\nCreate file", "parents": [{ "id": "5bb8f7a48da4075bba6f15a7b74ba6fd38b5ce40", "displayId": "5bb8f7a" }] }], "start": 0, "filter": null }

        ],
        tags: { "size": 2, "limit": 25, "isLastPage": true, "values": [{ "id": "refs/tags/2.0.0", "displayId": "2.0.0", "latestChangeset": "1c5b2a0e3e7171d42a74cb4701f42d7901969819", "hash": "3f531ee49410eb05954ed6e2fe2153e6ba95c044" }, { "id": "refs/tags/1.0.0", "displayId": "1.0.0", "latestChangeset": "990f15c7f27a509ca62ef9c782c0b9418d7256ec", "hash": "17d7b111fb80981a498a3afe9f32bcf457ae7307" }], "start": 0, "filter": null }
    }
	
	/*
	// dummy version from stash
	Data:{
			"commits": [
				{
					"size": 20,
					"limit": 25,
					"isLastPage": true,
					"values": [
						{
							"id": "0a943a29376f2336b78312d99e65da17048951db",
							"displayId": "0a943a2",
							"author": {
								"name": "Anna Buttfield",
								"emailAddress": "abuttfield@cascade.sydney.atlassian.com"
							},
							"authorTimestamp": 1296709267000,
							"message": "Copy C.zip as D.zip",
							"parents": [
								{
									"id": "e0a3f6d8c804c375f49d7609328111e8dc75a4bc",
									"displayId": "e0a3f6d"
								}
							]
						},
						{
							"id": "e0a3f6d8c804c375f49d7609328111e8dc75a4bc",
							"displayId": "e0a3f6d",
							"author": {
								"name": "Anna Buttfield",
								"emailAddress": "abuttfield@cascade.sydney.atlassian.com"
							},
							"authorTimestamp": 1296709220000,
							"message": "Add binary file C.zip",
							"parents": [
								{
									"id": "2d8897c9ac29ce42c3442cf80ac977057045e7f6",
									"displayId": "2d8897c"
								}
							]
						},
						{
							"id": "2d8897c9ac29ce42c3442cf80ac977057045e7f6",
							"displayId": "2d8897c",
							"author": {
								"name": "Anna Buttfield",
								"emailAddress": "abuttfield@cascade.sydney.atlassian.com"
							},
							"authorTimestamp": 1296709182000,
							"message": "Rename A.zip to B.zip",
							"parents": [
								{
									"id": "9c05f43f859375e392d90d23a13717c16d0fdcda",
									"displayId": "9c05f43"
								}
							]
						},
						{
							"id": "9c05f43f859375e392d90d23a13717c16d0fdcda",
							"displayId": "9c05f43",
							"author": {
								"name": "Anna Buttfield",
								"emailAddress": "abuttfield@cascade.sydney.atlassian.com"
							},
							"authorTimestamp": 1296709147000,
							"message": "Add binary file A.zip",
							"parents": [
								{
									"id": "6053a1eaa1c009dd11092d09a72f3c41af1b59ad",
									"displayId": "6053a1e"
								}
							]
						},
						{
							"id": "6053a1eaa1c009dd11092d09a72f3c41af1b59ad",
							"displayId": "6053a1e",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1292816475000,
							"message": "modification on branch_mod_merge",
							"parents": [
								{
									"id": "042fb0cc198e7320b59a025689b45a2cb52f4684",
									"displayId": "042fb0c"
								}
							]
						},
						{
							"id": "042fb0cc198e7320b59a025689b45a2cb52f4684",
							"displayId": "042fb0c",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1292816475000,
							"message": "branch, mod and merge scenario",
							"parents": [
								{
									"id": "8fb8538799b2481750eac52716931d895d029b7c",
									"displayId": "8fb8538"
								}
							]
						},
						{
							"id": "8fb8538799b2481750eac52716931d895d029b7c",
							"displayId": "8fb8538",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1292816368000,
							"message": "basic branching scenario",
							"parents": [
								{
									"id": "53979b3304bece75a3852a3d250dbaed64d45430",
									"displayId": "53979b3"
								}
							]
						},
						{
							"id": "53979b3304bece75a3852a3d250dbaed64d45430",
							"displayId": "53979b3",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1292816350000,
							"message": "moved mv_dir to moved_dir",
							"parents": [
								{
									"id": "ed69be6064dcef2d0b08b35192f581613e48411b",
									"displayId": "ed69be6"
								}
							]
						},
						{
							"id": "ed69be6064dcef2d0b08b35192f581613e48411b",
							"displayId": "ed69be6",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1292816350000,
							"message": "about to move a directory",
							"parents": [
								{
									"id": "05c78271ed4d7a158fe6789f6b27e3a47631faba",
									"displayId": "05c7827"
								}
							]
						},
						{
							"id": "05c78271ed4d7a158fe6789f6b27e3a47631faba",
							"displayId": "05c7827",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1292816337000,
							"message": "symlink scenario",
							"parents": [
								{
									"id": "57150c54c38d6570b2fd5e6d6cfc19476de44e84",
									"displayId": "57150c5"
								}
							]
						},
						{
							"id": "57150c54c38d6570b2fd5e6d6cfc19476de44e84",
							"displayId": "57150c5",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1292816238000,
							"message": "moved mv_file.txt to moved_file.txt",
							"parents": [
								{
									"id": "9fbc34a0d905950131d73f352abe68520c6db2a3",
									"displayId": "9fbc34a"
								}
							]
						},
						{
							"id": "9fbc34a0d905950131d73f352abe68520c6db2a3",
							"displayId": "9fbc34a",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1292816238000,
							"message": "move file scenario",
							"parents": [
								{
									"id": "6d8e9736357657738d15cd29069f21bf44553e19",
									"displayId": "6d8e973"
								}
							]
						},
						{
							"id": "6d8e9736357657738d15cd29069f21bf44553e19",
							"displayId": "6d8e973",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1292816132000,
							"message": "deleted file del_file/del_file.txt",
							"parents": [
								{
									"id": "4f9290ae1a9fcde7acd56664a22cc65eb76540f3",
									"displayId": "4f9290a"
								}
							]
						},
						{
							"id": "4f9290ae1a9fcde7acd56664a22cc65eb76540f3",
							"displayId": "4f9290a",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1292816132000,
							"message": "delete file scenario",
							"parents": [
								{
									"id": "8a71bdc3c67e49729db5f17f0477cee857fd7ae7",
									"displayId": "8a71bdc"
								}
							]
						},
						{
							"id": "8a71bdc3c67e49729db5f17f0477cee857fd7ae7",
							"displayId": "8a71bdc",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1292816101000,
							"message": "add a file",
							"parents": [
								{
									"id": "bf3346620ec9161977fc23dee1240a7991e64ca1",
									"displayId": "bf33466"
								}
							]
						},
						{
							"id": "bf3346620ec9161977fc23dee1240a7991e64ca1",
							"displayId": "bf33466",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1292816091000,
							"message": "edited modification/mod_file.txt",
							"parents": [
								{
									"id": "e26cab95a50f6e99d2c46c498a23cee307cc8e27",
									"displayId": "e26cab9"
								}
							]
						},
						{
							"id": "e26cab95a50f6e99d2c46c498a23cee307cc8e27",
							"displayId": "e26cab9",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1292816091000,
							"message": "plain modification, initial add",
							"parents": [
								{
									"id": "2e10dd2d1d5eea9291b296e78312e8a703964a95",
									"displayId": "2e10dd2"
								}
							]
						},
						{
							"id": "2e10dd2d1d5eea9291b296e78312e8a703964a95",
							"displayId": "2e10dd2",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1263071288000,
							"message": "mod on branch, earlier than its parent",
							"parents": [
								{
									"id": "c2608f5dff150e2b26b4b68d9e22369581b39b0c",
									"displayId": "c2608f5"
								}
							]
						},
						{
							"id": "c2608f5dff150e2b26b4b68d9e22369581b39b0c",
							"displayId": "c2608f5",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1263074949000,
							"message": "modification, with earlier date than its parent",
							"parents": [
								{
									"id": "409a2180fd95b744df8d817e770b7f8c853f78dc",
									"displayId": "409a218"
								}
							]
						},
						{
							"id": "409a2180fd95b744df8d817e770b7f8c853f78dc",
							"displayId": "409a218",
							"author": {
								"name": "Michael Heemskerk",
								"emailAddress": "mheemskerk@atlassian.com"
							},
							"authorTimestamp": 1263078610000,
							"message": "out of order commits scenario, initial commit",
							"parents": []
						}
					],
					"start": 0,
					"filter": null
				}
			],
			"branches": {
				"size": 4,
				"limit": 25,
				"isLastPage": true,
				"values": [
					{
						"id": "refs/heads/master",
						"displayId": "master",
						"latestChangeset": "0a943a29376f2336b78312d99e65da17048951db",
						"isDefault": true
					},
					{
						"id": "refs/heads/branch_mod_merge",
						"displayId": "branch_mod_merge",
						"latestChangeset": "6053a1eaa1c009dd11092d09a72f3c41af1b59ad",
						"isDefault": false
					},
					{
						"id": "refs/heads/basic_branching",
						"displayId": "basic_branching",
						"latestChangeset": "d6edcbf924697ab811a867421dab60d954ccad99",
						"isDefault": false
					},
					{
						"id": "refs/heads/out_of_order_branch",
						"displayId": "out_of_order_branch",
						"latestChangeset": "2e10dd2d1d5eea9291b296e78312e8a703964a95",
						"isDefault": false
					}
				],
				"start": 0,
				"filter": null
			},
			"tags": {
				"size": 3,
				"limit": 25,
				"isLastPage": true,
				"values": [
					{
						"id": "refs/tags/retagged_signed_tag",
						"displayId": "retagged_signed_tag",
						"latestChangeset": "12ebe2a58367347cd39f19f5a72f3cbec7b8f9a9",
						"hash": "9b4e781dea0769888fe270e06ad76675f73851b1"
					},
					{
						"id": "refs/tags/signed_tag",
						"displayId": "signed_tag",
						"latestChangeset": "0a943a29376f2336b78312d99e65da17048951db",
						"hash": "12ebe2a58367347cd39f19f5a72f3cbec7b8f9a9"
					},
					{
						"id": "refs/tags/backdated_annotated_tag",
						"displayId": "backdated_annotated_tag",
						"latestChangeset": "57150c54c38d6570b2fd5e6d6cfc19476de44e84",
						"hash": "80aa5be5ecf39660f798858482254f7a2ae9110e"
					}
				],
				"start": 0,
				"filter": null
			}
		}
		*/
};
